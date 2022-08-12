export function infoSaveNFTRequest(id, nftName, description, owner, contractAddress, imageUri) {
    const saveNFTRequest = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "id": id,
            "nftName": nftName,
            "description": description,
            "owner": owner,
            "contractAddress": contractAddress.toLowerCase(),
            "imageUri": imageUri
        })
    };

    return saveNFTRequest;

}


export function infoTransactionRequest(event, fromAccount, toAccount, time, itemId, currentPrice) {
    const transactionRequest = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "event": event,
            "fromAccount": fromAccount.toLowerCase(),
            "toAccount": toAccount.toLowerCase(),
            "time": time,
            "itemId": itemId,
            "currentPrice": currentPrice
        })
    };

    return transactionRequest;

}

export async function saveNFT(requestOptions) {
    // POST request using fetch with async/await
    const url = "http://localhost:9090/api/v1/item/save_NFT";
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    console.log(data);
    return data;

}



export async function saveAccount(requestOptions) {
    // POST request using fetch with async/await
    const url = "http://localhost:9090/api/v1/account/save_account";
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    console.log(data);
    return data;

}

export async function saveTransaction(requestOptions) {
    // POST request using fetch with async/await
    const url = "http://localhost:9090/api/v1/transaction/save_transaction";
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    console.log(data);
    return data;

}






