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
  
  export function feltToStr(felt) {
    const feltStr = felt.toString(2); // Convert BigInt to binary string
    const padLength = (feltStr.length % 8 !== 0) ? 8 - (feltStr.length % 8) : 0;
    const paddedFeltStr = '0'.repeat(padLength) + feltStr;
    const length = Math.ceil(paddedFeltStr.length / 8);
    const bytes = new Uint8Array(length);
  
    for (let i = 0; i < length; i++) {
      const byteStart = i * 8;
      const byteEnd = byteStart + 8;
      bytes[i] = parseInt(paddedFeltStr.slice(byteStart, byteEnd), 2);
    }
  
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  }

  export const bigIntToHexString = (bigIntValue) => {
    const hexString = bigIntValue.toString(16);
    return "0x" + hexString;
  };
  


  export const convertToDateTime = (bigIntValue) => {
    const date = new Date(Number(bigIntValue));
    return date.toLocaleString();
  };

  export const convertToDays = (bigIntValue) => {
  const days = Math.floor(Number(bigIntValue) / (1000 * 60 * 60 * 24));
  return days;
};