import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const [amount, setAmount] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account.length > 0) {
      console.log("Account connected: ", account[0]);
      setAccount(account[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    //
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  //
  const deposit = async () => {
    if (atm) {
      setLoading(true);
      setNotification("");
      try {
        let tx = await atm.deposit(amount);
        await tx.wait();
        getBalance();
        addTransaction("deposit", amount);
        setNotification("Deposit successful!");
      } catch (error) {
        setNotification("Error during deposit.");
      }
      setLoading(false);
    }
  };

  //
  const withdraw = async () => {
    if (atm) {
      setLoading(true);
      setNotification("");
      try {
        let tx = await atm.withdraw(amount);
        await tx.wait();
        getBalance();
        addTransaction("withdraw", amount);
        setNotification("Withdrawal successful!");
      } catch (error) {
        setNotification("Error during withdrawal.");
      }
      setLoading(false);
    }
  };

  //
  const addTransaction = (type, amount) => {
    const newTransaction = { type, amount, date: new Date().toLocaleString() };
    setTransactions([newTransaction, ...transactions]);
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value))}
          min="1"
        />
        {
          //
        }
        <button onClick={deposit} disabled={loading}>
          Deposit {amount} ETH
        </button>
        <button onClick={withdraw} disabled={loading}>
          Withdraw {amount} ETH
        </button>
        {
          //
        }
        {loading && <p>Transaction in progress...</p>}
        {
          //
        }
        {notification && <p>{notification}</p>}
        <h3>Transaction History</h3>
        <ul>
          {transactions.map((tx, index) => (
            <li key={index}>
              {tx.date} - {tx.type} {tx.amount} ETH
            </li>
          ))}
        </ul>{" "}
        {}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>
        {`
          .container {
            text-align: center;
          }
          input {
            margin: 10px;
            padding: 5px;
          }
          button {
            margin: 5px;
            padding: 10px;
            cursor: pointer;
          }
          ul {
            list-style-type: none;
            padding: 0;
          }
          li {
            margin: 5px 0;
            padding: 10px;
            background: #f0f0f0;
          }
        `}
      </style>
    </main>
  );
}
