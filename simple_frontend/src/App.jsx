import { useState } from "react";
import "./App.css";
import { Account, Contract, RpcProvider, shortString } from "starknet";
import { ABI } from "./assets/abi";
import { BigNumber } from "bignumber.js";
import { connect, disconnect } from "starknetkit";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [balance, setBalance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [address, setAddress] = useState(null);
  const [balAdd, setBalAdd] = useState(null);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState(null);
  const [owner, setOwner] = useState("");
  const [mintRec, setMintRec] = useState("");
  const [tranRec, setTranRec] = useState("");
  const [mintAmt, setMintAmt] = useState("");
  const [tranAmt, setTranAmt] = useState("");
  const [decimal, setDecimal] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  const [allowance, setAllowance] = useState("");
  const [tfAmount, setTFAmount] = useState("");
  const [tfRecipient, setTFRecipient] = useState("");
  const [tfOwner, setTFOwner] = useState("");
  const [aSpender, setASpender] = useState("");
  const [aAmount, setAAmount] = useState("");
  const [iAmount, setIAmount] = useState("");
  const [dAmount, setDAmount] = useState("");
  const [bAmount, setBAmount] = useState("");
  const [iSpender, setISpender] = useState("");
  const [aOwn, setAOwn] = useState("");
  const [dSpender, setDSpender] = useState("");
  const [aSpen, setASpen] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [formVisible, setFormVisible] = useState("");

  const { VITE_SEPOLIA_URL, VITE_ACCOUNT_ADDRESS, VITE_PRIVATE_KEY } =
    import.meta.env;

  const CONTRACT_ADDRESS =
    "0x070662f85e0d54ca2c90d9ccb7afb905a069a1e154b8c2615a7ac265fc51516d";

  const PROVIDER = new RpcProvider({
    nodeUrl: import.meta.env.VITE_SEPOLIA_URL,
  });

  const connectWallet = async () => {
    if (address) {
      disconnect();
      setProvider(null);
      setAccount(null);
      setAddress(null);
      return;
    }

    const { wallet } = await connect({
      provider: PROVIDER,
    });
    console.log(wallet);

    if (wallet && wallet.isConnected) {
      setProvider(wallet.provider);
      setAccount(wallet.account);
      setAddress(wallet.selectedAddress);
    }
  };

  const checkConnection = () => {
    if (!address) {
      toast.error("Conect wallet!");
      return;
    }
  };

  const viewContract = () => {
    return new Contract(ABI, CONTRACT_ADDRESS, provider);
  };

  const stateChangeContract = () => {
    return new Contract(ABI, CONTRACT_ADDRESS, account);
  };

  const convertFelt252ToString = (felt252) => {
    try {
      const bn = BigNumber(felt252);
      const hex_it = "0x" + bn.toString(16);

      return shortString.decodeShortString(hex_it);
    } catch (error) {
      console.log("Error: " + error);
    }
  };

  const hex_it = (tx) => {
    return "0x" + tx.toString(16);
  };

  const getName = async () => {
    checkConnection();

    if (provider) {
      const contract = viewContract();

      try {
        const tx = await contract.name();
        setName(convertFelt252ToString(tx));
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const getSymbol = async () => {
    checkConnection();
    if (provider) {
      const contract = viewContract();

      try {
        const tx = await contract.symbol();
        console.log(tx);

        setSymbol(convertFelt252ToString(tx));
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const getDecimal = async () => {
    checkConnection();
    if (provider) {
      const contract = viewContract();

      try {
        const tx = await contract.decimals();
        setDecimal(BigNumber(tx).toString());
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const getTotalSupply = async () => {
    checkConnection();
    if (provider) {
      const contract = viewContract();

      try {
        const tx = await contract.total_supply();
        setTotalSupply(BigNumber(tx).toString());
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const getOwner = async () => {
    checkConnection();
    if (provider) {
      const contract = viewContract();

      try {
        const tx = await contract.owner();

        setOwner(hex_it(tx));
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const balanceOf = async (addr) => {
    checkConnection();
    if (provider) {
      const contract = viewContract();

      try {
        const tx = await contract.balance_of(addr);
        console.log(tx);

        setBalance(BigNumber(tx).toString());
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const getAllowance = async (ow, sp) => {
    checkConnection();
    if (provider) {
      const contract = viewContract();

      try {
        const tx = await contract.allowance(ow, sp);
        console.log(tx);

        setAllowance(BigNumber(tx).toString());
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const mint = async (r, a) => {
    checkConnection();
    if (account) {
      try {
        const contract = stateChangeContract();

        const res = await contract.mint(r, a);

        const txHash = res?.transaction_hash;

        const txResult = await provider.waitForTransaction(txHash);

        const events = contract.parseEvents(txResult);
        console.log(events[0]);

        const rec = events[0]["starknet_erc20::erc_20::ERC20::Mint"].receiver;
        const amn = events[0]["starknet_erc20::erc_20::ERC20::Mint"].amount;

        toast.success(
          `${BigNumber(amn).toString()} tokens has been minted to ${hex_it(
            rec
          )} successfully`
        );
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const transfer = async (rc, at) => {
    checkConnection();
    if (account) {
      try {
        const contract = stateChangeContract();

        const res = await contract.transfer(rc, at);

        const txHash = res?.transaction_hash;

        const txResult = await provider.waitForTransaction(txHash);

        const events = contract.parseEvents(txResult);

        const rec =
          events[0]["starknet_erc20::erc_20::ERC20::Transfer"].receiver;
        const amn = events[0]["starknet_erc20::erc_20::ERC20::Transfer"].amount;

        console.log("without: ", rec);
        console.log("with: ", hex_it(rec));

        toast.success(`
          ${BigNumber(amn).toString()} tokens has been transferred to
          ${hex_it(rec)} successfully
        `);
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const transferFrom = async (ow, rc, am) => {
    checkConnection();
    if (account) {
      try {
        const contract = stateChangeContract();

        const res = await contract.transfer_from(ow, rc, am);

        const txHash = res?.transaction_hash;

        const txResult = await provider.waitForTransaction(txHash);

        const events = contract.parseEvents(txResult);

        const rec =
          events[0]["starknet_erc20::erc_20::ERC20::Transfer"].receiver;
        const amn = events[0]["starknet_erc20::erc_20::ERC20::Transfer"].amount;
        console.log(BigNumber(amn).toString());

        toast.success(
          `${BigNumber(amn).toString()} tokens has been transferred to ${hex_it(
            rec
          )} successfully`
        );
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const approve = async (sp, am) => {
    checkConnection();
    if (account) {
      try {
        const contract = stateChangeContract();

        const res = await contract.approve(sp, am);

        const txHash = res?.transaction_hash;

        const txResult = await provider.waitForTransaction(txHash);

        const events = contract.parseEvents(txResult);

        const rec =
          events[0]["starknet_erc20::erc_20::ERC20::Approval"].spender;
        const amn = events[0]["starknet_erc20::erc_20::ERC20::Approval"].value;

        toast.success(
          `${hex_it(rec)} is approved to spend ${BigNumber(
            amn
          ).toString()} tokens successfully`
        );
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const increaseAllowance = async (sp, am) => {
    checkConnection();
    if (account) {
      try {
        const contract = stateChangeContract();

        const res = await contract.increase_allowance(sp, am);

        const txHash = res?.transaction_hash;

        const txResult = await provider.waitForTransaction(txHash);

        const events = contract.parseEvents(txResult);

        const rec =
          events[0]["starknet_erc20::erc_20::ERC20::Approval"].spender;
        const amn = events[0]["starknet_erc20::erc_20::ERC20::Approval"].value;

        toast.success(
          `${rec} is approved to spend extra ${BigNumber(
            amn
          ).toString()} tokens successfully`
        );
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const decreaseAllowance = async (sp, am) => {
    checkConnection();
    if (account) {
      try {
        const contract = stateChangeContract();

        const res = await contract.decrease_allowance(sp, am);

        const txHash = res?.transaction_hash;

        const txResult = await provider.waitForTransaction(txHash);

        const events = contract.parseEvents(txResult);

        const rec =
          events[0]["starknet_erc20::erc_20::ERC20::Approval"].spender;
        const amn = events[0]["starknet_erc20::erc_20::ERC20::Approval"].value;

        toast.success(
          `${BigNumber(amn).toString()} token(s) is removed from ${hex_it(
            rec
          )} allowances`
        );
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const burn = async (am) => {
    checkConnection();
    if (account) {
      try {
        const contract = stateChangeContract();

        const res = await contract.burn(am);

        const txHash = res?.transaction_hash;

        const txResult = await provider.waitForTransaction(txHash);

        const events = contract.parseEvents(txResult);

        const amn = events[0]["starknet_erc20::erc_20::ERC20::Burnt"].value;

        toast.success(
          `${BigNumber(amn).toString()} token(s) burnt successfully`
        );
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const initOwnership = async (pow) => {
    checkConnection();
    if (account) {
      try {
        const contract = stateChangeContract();

        const res = await contract.init_ownership(pow);

        const txHash = res?.transaction_hash;

        const txResult = await provider.waitForTransaction(txHash);

        toast.success("Transfer of Ownership initiated successfully");
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const claimOwnership = async () => {
    checkConnection();
    if (account) {
      try {
        const contract = stateChangeContract();

        const res = await contract.claim_ownership();

        const txHash = res?.transaction_hash;

        const txResult = await provider.waitForTransaction(txHash);

        const events = contract.parseEvents(txResult);

        const current =
          events[0]["starknet_erc20::erc_20::ERC20::Ownership"].current_owner;
        const prev =
          events[0]["starknet_erc20::erc_20::ERC20::Ownership"].prev_owner;

        toast.success(`
          ${hex_it(prev)} 
          transferred ownership to 
          ${hex_it(current)} 
          successfully
          `);
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <button onClick={connectWallet} className="connect-btn">
          {address ? `${address.substring(0, 10)}...` : "Connect Wallet"}
        </button>
      </header>

      <h1 className="title">Starknet ERC 20</h1>
      <div className="main-content">
        {/* Card 1 */}
        <div className="card card-1">
          <div className="group-1">
            <div>
              <button onClick={getName}>Get Name</button>
              <h2 className="outputs">{`${name ? name : " "}`}</h2>
            </div>

            <div className="separator"></div>
            <div>
              <button onClick={getSymbol}>Get Symbol</button>
              <h2 className="outputs">{`${symbol ? symbol : " "}`}</h2>
            </div>

            <div className="separator"></div>
            <div>
              <button onClick={getOwner}>Get Owner</button>
              <h2 className="outputs">{`${owner ? owner : " "}`}</h2>
            </div>

            <div className="separator"></div>
            <div>
              <button onClick={getDecimal}>Get Decimal</button>
              <h2 className="outputs">{`${decimal ? decimal : " "}`}</h2>
            </div>

            <div className="separator"></div>
            <div>
              <button onClick={getTotalSupply}>Get Total Supply</button>
              <h2 className="outputs">{`${
                totalSupply ? totalSupply : " "
              }`}</h2>
            </div>

            <div className="separator"></div>
            {/* Allowance */}
            <div>
              <button onClick={() => setFormVisible("allowance")}>
                Allowance
              </button>
              {formVisible === "allowance" && (
                <form
                  className="function-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    getAllowance(aOwn, aSpen);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Owner"
                    value={aOwn}
                    onChange={(e) => setAOwn(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Spender"
                    value={aSpen}
                    onChange={(e) => setASpen(e.target.value)}
                  />
                  <button type="submit">Submit</button>
                  <h2 className="outputs">{`${
                    allowance ? allowance : " "
                  }`}</h2>
                </form>
              )}
            </div>

            <div className="separator"></div>
            {/* Balance_of */}
            <div>
              <button onClick={() => setFormVisible("balance_of")}>
                Get Balance
              </button>
              {formVisible === "balance_of" && (
                <form
                  className="function-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    balanceOf(balAdd);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Enter address"
                    value={balAdd}
                    onChange={(e) => setBalAdd(e.target.value)}
                  />
                  <button type="submit">Submit</button>
                  <h2 className="outputs">{`${balance ? balance : " "}`}</h2>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card card-2">
          <div className="group-2">
            {/* Mint */}
            <div>
              <button onClick={() => setFormVisible("mint")}>
                Mint Tokens
              </button>
              {formVisible === "mint" && (
                <form
                  className="function-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    mint(mintRec, mintAmt);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Recipient"
                    value={mintRec}
                    onChange={(e) => setMintRec(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={mintAmt}
                    onChange={(e) => setMintAmt(e.target.value)}
                  />
                  <button type="submit">Submit</button>
                </form>
              )}
            </div>

            <div className="separator"></div>

            {/* Transfer */}
            <div>
              <button onClick={() => setFormVisible("transfer")}>
                Transfer Tokens
              </button>
              {formVisible === "transfer" && (
                <form
                  className="function-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    transfer(tranRec, tranAmt);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Recipient"
                    value={tranRec}
                    onChange={(e) => setTranRec(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={tranAmt}
                    onChange={(e) => setTranAmt(e.target.value)}
                  />
                  <button type="submit">Submit</button>
                </form>
              )}
            </div>

            <div className="separator"></div>

            {/* Approve */}
            <div>
              <button onClick={() => setFormVisible("approve")}>Approve</button>
              {formVisible === "approve" && (
                <form
                  className="function-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    approve(aSpender, aAmount);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Spender"
                    value={aSpender}
                    onChange={(e) => setASpender(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={aAmount}
                    onChange={(e) => setAAmount(e.target.value)}
                  />
                  <button type="submit">Submit</button>
                </form>
              )}
            </div>

            <div className="separator"></div>

            {/* Transfer From */}
            <div>
              <button onClick={() => setFormVisible("transferFrom")}>
                Transfer From
              </button>
              {formVisible === "transferFrom" && (
                <form
                  className="function-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    transferFrom(tfOwner, tfRecipient, tfAmount);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Owner"
                    value={tfOwner}
                    onChange={(e) => setTFOwner(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Recipient"
                    value={tfRecipient}
                    onChange={(e) => setTFRecipient(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={tfAmount}
                    onChange={(e) => setTFAmount(e.target.value)}
                  />
                  <button type="submit">Submit</button>
                </form>
              )}
            </div>

            <div className="separator"></div>

            {/* Increase Allowance */}
            <div>
              <button onClick={() => setFormVisible("increaseAllowance")}>
                Allowance +
              </button>
              {formVisible === "increaseAllowance" && (
                <form
                  className="function-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    increaseAllowance(iSpender, iAmount);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Spender"
                    value={iSpender}
                    onChange={(e) => setISpender(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={iAmount}
                    onChange={(e) => setIAmount(e.target.value)}
                  />
                  <button type="submit">Submit</button>
                </form>
              )}
            </div>
            <div className="separator"></div>

            {/* Decrease Allowance */}
            <div>
              <button onClick={() => setFormVisible("decreaseAllowance")}>
                Allowance -
              </button>
              {formVisible === "decreaseAllowance" && (
                <form
                  className="function-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    decreaseAllowance(dSpender, dAmount);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Spender"
                    value={dSpender}
                    onChange={(e) => setDSpender(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={dAmount}
                    onChange={(e) => setDAmount(e.target.value)}
                  />
                  <button type="submit">Submit</button>
                </form>
              )}
            </div>
            <div className="separator"></div>

            {/* Burn */}
            <div>
              <button onClick={() => setFormVisible("burn")}>Burn</button>
              {formVisible === "burn" && (
                <form
                  className="function-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    burn(bAmount);
                  }}
                >
                  <input
                    type="number"
                    placeholder="Amount"
                    value={bAmount}
                    onChange={(e) => setBAmount(e.target.value)}
                  />
                  <button type="submit">Submit</button>
                </form>
              )}
            </div>
            <div className="separator"></div>

            {/* Init Ownership */}
            <div>
              <button onClick={() => setFormVisible("initOwnership")}>
                Init Ownership
              </button>
              {formVisible === "initOwnership" && (
                <form
                  className="function-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    initOwnership(newOwner);
                  }}
                >
                  <input
                    type="text"
                    placeholder="New Owner"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                  />
                  <button type="submit">Submit</button>
                </form>
              )}
            </div>
            <div className="separator"></div>

            {/* Claim Ownership */}
            <div>
              <button onClick={claimOwnership}>Claim Ownership</button>
            </div>

            {/* Other functions */}
            {/* Transfer From, Increase Allowance, Decrease Allowance, Burn, Init Ownership, Claim Ownership */}
          </div>
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className="app-container">
  //     <header className="header">
  //       <button onClick={connectWallet} className="connect-btn">
  //         {address ? `${address.substring(0, 10)}...` : "Connect Wallet"}
  //       </button>
  //     </header>

  //     <div className="buttons-container">
  //       <h1 className="title">Starknet ERC 20</h1>

  //       <div className="card">
  //         <div>
  //           <button onClick={getName}>Get Name</button>
  //           <h2 className="outputs">{`${name ? name : " "}`}</h2>
  //         </div>

  //         <div className="separator"></div>
  //         <div>
  //           <button onClick={getSymbol}>Get Symbol</button>
  //           <h2 className="outputs">{`${symbol ? symbol : " "}`}</h2>
  //         </div>

  //         <div className="separator"></div>
  //         <div>
  //           <button onClick={getOwner}>Get Owner</button>
  //           <h2 className="outputs">{`${owner ? owner : " "}`}</h2>
  //         </div>

  //         <div className="separator"></div>
  //         <div>
  //           <button onClick={getDecimal}>Get Decimal</button>
  //           <h2 className="outputs">{`${decimal ? decimal : " "}`}</h2>
  //         </div>
  //         <div className="separator"></div>
  //         <div>
  //           <button onClick={getTotalSupply}>Get Total Supply</button>
  //           <h2 className="outputs">{`${totalSupply ? totalSupply : " "}`}</h2>
  //         </div>

  //         <div className="separator"></div>
  //         {/* Allowance */}
  //         <div>
  //           <button onClick={() => setFormVisible("allowance")}>
  //             Allowance
  //           </button>
  //           {formVisible === "allowance" && (
  //             <form
  //               className="function-form"
  //               onSubmit={(e) => {
  //                 e.preventDefault();
  //                 getAllowance(aOwn, aSpen);
  //               }}
  //             >
  //               <input
  //                 type="text"
  //                 placeholder="Owner"
  //                 value={aOwn}
  //                 onChange={(e) => setAOwn(e.target.value)}
  //               />
  //               <input
  //                 type="text"
  //                 placeholder="Spender"
  //                 value={aSpen}
  //                 onChange={(e) => setASpen(e.target.value)}
  //               />
  //               <button type="submit">Submit</button>

  //               <h2 className="outputs">{`${allowance ? allowance : " "}`}</h2>
  //             </form>
  //           )}
  //         </div>

  //         <div className="separator"></div>

  //         {/* Balance_of */}
  //         <div>
  //           <button onClick={() => setFormVisible("balance_of")}>
  //             Get Balance
  //           </button>
  //           {formVisible === "balance_of" && (
  //             <form
  //               className="function-form"
  //               onSubmit={(e) => {
  //                 e.preventDefault();
  //                 balanceOf(balAdd);
  //               }}
  //             >
  //               <input
  //                 type="text"
  //                 placeholder="Enter address"
  //                 value={balAdd}
  //                 onChange={(e) => setBalAdd(e.target.value)}
  //               />
  //               <button type="submit">Submit</button>

  //               <h2 className="outputs">{`${balance ? balance : " "}`}</h2>
  //             </form>
  //           )}
  //         </div>

  //         <div className="separator"></div>

  //         {/* Mint */}
  //         <div>
  //           <button onClick={() => setFormVisible("mint")}>Mint Tokens</button>
  //           {formVisible === "mint" && (
  //             <form
  //               className="function-form"
  //               onSubmit={(e) => {
  //                 e.preventDefault();
  //                 mint(mintRec, mintAmt);
  //               }}
  //             >
  //               <input
  //                 type="text"
  //                 placeholder="Recipient"
  //                 value={mintRec}
  //                 onChange={(e) => setMintRec(e.target.value)}
  //               />
  //               <input
  //                 type="number"
  //                 placeholder="Amount"
  //                 value={mintAmt}
  //                 onChange={(e) => setMintAmt(e.target.value)}
  //               />
  //               <button type="submit">Submit</button>
  //             </form>
  //           )}
  //         </div>

  //         <div className="separator"></div>

  //         {/* Transfer */}
  //         <div>
  //           <button onClick={() => setFormVisible("transfer")}>
  //             Transfer Tokens
  //           </button>
  //           {formVisible === "transfer" && (
  //             <form
  //               className="function-form"
  //               onSubmit={(e) => {
  //                 e.preventDefault();
  //                 transfer(tranRec, tranAmt);
  //               }}
  //             >
  //               <input
  //                 type="text"
  //                 placeholder="Recipient"
  //                 value={tranRec}
  //                 onChange={(e) => setTranRec(e.target.value)}
  //               />
  //               <input
  //                 type="number"
  //                 placeholder="Amount"
  //                 value={tranAmt}
  //                 onChange={(e) => setTranAmt(e.target.value)}
  //               />
  //               <button type="submit">Submit</button>
  //             </form>
  //           )}
  //         </div>
  //         <div className="separator"></div>

  //         {/* Approve */}
  //         <div>
  //           <button onClick={() => setFormVisible("approve")}>Approve</button>
  //           {formVisible === "approve" && (
  //             <form
  //               className="function-form"
  //               onSubmit={(e) => {
  //                 e.preventDefault();
  //                 approve(aSpender, aAmount);
  //               }}
  //             >
  //               <input
  //                 type="text"
  //                 placeholder="Spender"
  //                 value={aSpender}
  //                 onChange={(e) => setASpender(e.target.value)}
  //               />
  //               <input
  //                 type="number"
  //                 placeholder="Amount"
  //                 value={aAmount}
  //                 onChange={(e) => setAAmount(e.target.value)}
  //               />
  //               <button type="submit">Submit</button>
  //             </form>
  //           )}
  //         </div>
  // <div className="separator"></div>

  // {/* Transfer From */}
  // <div>
  //   <button onClick={() => setFormVisible("transferFrom")}>
  //     Transfer From
  //   </button>
  //   {formVisible === "transferFrom" && (
  //     <form
  //       className="function-form"
  //       onSubmit={(e) => {
  //         e.preventDefault();
  //         transferFrom(tfOwner, tfRecipient, tfAmount);
  //       }}
  //     >
  //       <input
  //         type="text"
  //         placeholder="Owner"
  //         value={tfOwner}
  //         onChange={(e) => setTFOwner(e.target.value)}
  //       />
  //       <input
  //         type="text"
  //         placeholder="Recipient"
  //         value={tfRecipient}
  //         onChange={(e) => setTFRecipient(e.target.value)}
  //       />
  //       <input
  //         type="number"
  //         placeholder="Amount"
  //         value={tfAmount}
  //         onChange={(e) => setTFAmount(e.target.value)}
  //       />
  //       <button type="submit">Submit</button>
  //     </form>
  //   )}
  // </div>

  // <div className="separator"></div>

  // {/* Increase Allowance */}
  // <div>
  //   <button onClick={() => setFormVisible("increaseAllowance")}>
  //     Allowance +
  //   </button>
  //   {formVisible === "increaseAllowance" && (
  //     <form
  //       className="function-form"
  //       onSubmit={(e) => {
  //         e.preventDefault();
  //         increaseAllowance(iSpender, iAmount);
  //       }}
  //     >
  //       <input
  //         type="text"
  //         placeholder="Spender"
  //         value={iSpender}
  //         onChange={(e) => setISpender(e.target.value)}
  //       />
  //       <input
  //         type="number"
  //         placeholder="Amount"
  //         value={iAmount}
  //         onChange={(e) => setIAmount(e.target.value)}
  //       />
  //       <button type="submit">Submit</button>
  //     </form>
  //   )}
  // </div>
  // <div className="separator"></div>

  // {/* Decrease Allowance */}
  // <div>
  //   <button onClick={() => setFormVisible("decreaseAllowance")}>
  //     Allowance -
  //   </button>
  //   {formVisible === "decreaseAllowance" && (
  //     <form
  //       className="function-form"
  //       onSubmit={(e) => {
  //         e.preventDefault();
  //         decreaseAllowance(dSpender, dAmount);
  //       }}
  //     >
  //       <input
  //         type="text"
  //         placeholder="Spender"
  //         value={dSpender}
  //         onChange={(e) => setDSpender(e.target.value)}
  //       />
  //       <input
  //         type="number"
  //         placeholder="Amount"
  //         value={dAmount}
  //         onChange={(e) => setDAmount(e.target.value)}
  //       />
  //       <button type="submit">Submit</button>
  //     </form>
  //   )}
  // </div>
  // <div className="separator"></div>

  // {/* Burn */}
  // <div>
  //   <button onClick={() => setFormVisible("burn")}>Burn</button>
  //   {formVisible === "burn" && (
  //     <form
  //       className="function-form"
  //       onSubmit={(e) => {
  //         e.preventDefault();
  //         burn(bAmount);
  //       }}
  //     >
  //       <input
  //         type="number"
  //         placeholder="Amount"
  //         value={bAmount}
  //         onChange={(e) => setBAmount(e.target.value)}
  //       />
  //       <button type="submit">Submit</button>
  //     </form>
  //   )}
  // </div>
  // <div className="separator"></div>

  // {/* Init Ownership */}
  // <div>
  //   <button onClick={() => setFormVisible("initOwnership")}>
  //     Init Ownership
  //   </button>
  //   {formVisible === "initOwnership" && (
  //     <form
  //       className="function-form"
  //       onSubmit={(e) => {
  //         e.preventDefault();
  //         initOwnership(newOwner);
  //       }}
  //     >
  //       <input
  //         type="text"
  //         placeholder="New Owner"
  //         value={newOwner}
  //         onChange={(e) => setNewOwner(e.target.value)}
  //       />
  //       <button type="submit">Submit</button>
  //     </form>
  //   )}
  // </div>
  // <div className="separator"></div>

  // {/* Claim Ownership */}
  // <div>
  //   <button onClick={claimOwnership}>Claim Ownership</button>
  // </div>

  //         <ToastContainer
  //           position="top-right"
  //           autoClose={5000}
  //           hideProgressBar={false}
  //           newestOnTop={false}
  //           closeOnClick
  //           rtl={false}
  //           pauseOnFocusLoss
  //           draggable
  //           pauseOnHover
  //           transition:Bounce
  //           theme="colored"
  //         />
  //       </div>
  //     </div>
  //   </div>
  // );
}

export default App;
