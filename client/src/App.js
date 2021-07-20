import "./App.css";
import Web3 from "web3";
import { useState, Fragment } from "react";
import { authAxios } from "./utils/axios";

function App() {
  const [getErrorMessage, setErrorMessage] = useState("");
  const [getJWTToken, setJWTToken] = useState("");

  const handleSignin = async () => {
    setErrorMessage("");
    setJWTToken("");
    try {
      //Nonce to serve as message to be signed
      const { data: nonce } = await authAxios.get("/token");

      //Check to see if Metamask is installed
      if (!window.ethereum) {
        setErrorMessage(
          "No wallet found try https://metamask.io/download.html and setup an account!"
        );
        return;
      }
      //Get an account from Metamask
      const address = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (address.length < 0) {
        setErrorMessage("No account found. Please, configure an account");
      }
      const web3 = new Web3(Web3.givenProvider);

      //Signs data to unlock account
      const signature = await web3.eth.personal.sign(
        nonce.toString(),
        address[0]
      );

      //Authenticate user and return a token
      const { data: responseToken } = await authAxios.post("/auth", {
        address: address[0],
        signature,
        nonce,
      });

      setJWTToken(responseToken);
    } catch (error) {
      setErrorMessage(error.message);
      // console.log(error);
    }
  };

  return (
    <Fragment>
      <p> Click the below button to proceed</p>
      <button onClick={handleSignin}>{"Sign in"}</button>
      <p>{getErrorMessage ? getErrorMessage : null} </p>
      <p>{getJWTToken ? `JWT Auth token: ${getJWTToken}` : null} </p>
    </Fragment>
  );
}

export default App;
