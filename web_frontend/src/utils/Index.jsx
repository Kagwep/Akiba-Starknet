export const formatBalance = (rawBalance) => {
    const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(2);
    return balance;
};

export const formatChainAsNum = (chainIdHex) => {
    const chainIdNum = parseInt(chainIdHex);
    return chainIdNum;
};

export const formatAddress = (addr) => {
    if (addr.length < 10) return addr; // If the address is very short, just return it as is
  
    // Extract the first 5 characters and the last 4 characters
    const firstPart = addr.slice(0, 5);
    const lastPart = addr.slice(-4);
  
    return `${firstPart}...${lastPart}`;
  };
  