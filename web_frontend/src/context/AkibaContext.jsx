import React, { useState, useEffect } from 'react'
import { connect, disconnect } from 'starknetkit'

// create context
export const AkibaContext = React.createContext()


export const AkibaProvider = ({ children }) => {
  const [connection, setConnection] = useState();
  const [account, setAccount] = useState();
  const [address, setAddress] = useState('');

  const [retrievedValue, setRetrievedValue] = useState('');


  const updateConnection = (newConnection) => {
    setConnection((prevConnection) => newConnection);
  };

  const updateAccount = (newAccount) => {
    setAccount((prevAccount) => newAccount);
  };

  const updateAddress = (newAddress) => {
    setAddress((prevAddress) => newAddress);
  };

  const connectWallet = async () => {
    const newConnection = await connect({ webWalletUrl: "https://web.argent.xyz" });

    if (newConnection && newConnection.id !== "argentwallet" && newConnection.isConnected) {
      updateConnection(newConnection);
      updateAccount(newConnection.account);
      updateAddress(newConnection.selectedAddress);
          // Storing data in local storage
      localStorage.setItem('connectedWallet', JSON.stringify(newConnection));
      localStorage.setItem('account', JSON.stringify(newConnection.account));
      localStorage.setItem('address', newConnection.selectedAddress);

    }

    if (connection && connection.chainId !== "SN_GOERLI"){
      try{
        await window.starknet.request({
          type:"wallet_addStarknetChain",
          params:{
            chainId:"SN_GOERLI"
          }
        })

      }catch(error){
        alert("Please manually switch your wallet network to mainnet");
      }

    }
  };

  const disconnectWallet = async () => {
    await disconnect();
    setConnection(undefined);
    setAccount(undefined);
    setAddress('');
    localStorage.setItem('connectedWallet', JSON.stringify(undefined));
    localStorage.setItem('account', JSON.stringify(undefined));
    localStorage.setItem('address', '');
  };

  useEffect(() => {
    
  
    // Check if the saved data is not null or undefined before setting the state

      try {
        const savedConnection = JSON.parse(localStorage.getItem('connectedWallet'));
    
        const savedAccount = JSON.parse(localStorage.getItem('account'));
        const savedAddress = localStorage.getItem('address');
  
        if (savedConnection) {
          setConnection(savedConnection);
        }

        if (savedAccount) {
          setAccount(savedAccount);
        }
      
        if (savedAddress) {
          setAddress(savedAddress);
        }
      } catch (error) {
        console.error("Error:", 'No connection found');
        // Handle the error, e.g., by displaying a message to the user
      }
    
    

  }, []);
  

  return (
    <AkibaContext.Provider value={{
      connection,
      account,
      address,
      retrievedValue,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </AkibaContext.Provider>
  );
};
