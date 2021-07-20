require("dotenv").config();
const express = require("express");
const {
  keccak,
  fromRpcSig,
  ecrecover,
  toBuffer,
  bufferToHex,
  pubToAddress,
} = require("ethereumjs-util");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT;

app.use(cors());
const corsOptions = {
  origin: "http://localhost:3000",
};
app.use(express.json());
app.get("/token", (req, res) => {
  let nonce = Math.floor(Math.random() * 1000000).toString(); // in a real life scenario we would random this after each login and fetch it from the db as well
  return res.send(nonce);
});
app.post("/auth", cors(corsOptions), (req, res) => {
  const { address, signature, nonce } = req.body;

  // TODO: Validate signature by using eth tools (tip: ethereumjs-util and eth-sig-util)
  const nonceLength = nonce.toString().length;

  //Adds prefix to the message, makes the calculated signature recognisable as an Ethereum specific signature
  const prefixedMessage = keccak(
    Buffer.from(`\x19Ethereum Signed Message:\n${nonceLength}${nonce}`)
  );
  //Destructure signature into 3 variables
  const { v, r, s } = fromRpcSig(signature);
  //Sends the message and the signature to the network and recover the account
  const publicKey = ecrecover(toBuffer(prefixedMessage), v, r, s);

  const recoveredAddress = bufferToHex(pubToAddress(publicKey));

  if (recoveredAddress !== address) {
    return res.status(401).send();
  }

  const secret = process.env.JWTSecret;
  const token = jwt.sign(recoveredAddress, secret);

  return res.send(token);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
