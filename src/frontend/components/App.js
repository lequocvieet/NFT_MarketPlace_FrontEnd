import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './Navbar'
import Home from './Home.js'
import Create from './Create.js'
import { useEffect } from 'react';
import Inventory from './Inventory.js'
import NFTDetail from './NFTDetail.js'
import History from './History'
import Search from './Search'
import MarketplaceAbi from '../contractsData/Marketplace.json'
import MarketplaceAddress from '../contractsData/Marketplace-address.json'
import NFTAbi from '../contractsData/NFT.json'
import NFTAddress from '../contractsData/NFT-address.json'
import { useState } from 'react'
import { ethers } from 'ethers'
import { Spinner } from 'react-bootstrap'
import { saveAccount } from '../api/api'

import './App.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState({})
  const [marketplace, setMarketplace] = useState({})
  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })
    setAccount(accounts[0])
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()

    //call save account api to backend
    console.log(accounts[0])
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "address": accounts[0].toLowerCase()
      })
    };
    saveAccount(requestOptions);

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload()
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      window.location.reload()
      // Get provider from Metamask
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      // Set signer
      const signer = provider.getSigner()
    })
    loadContracts(signer)
  }
  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const marketplace = new ethers.Contract(
      MarketplaceAddress.address,
      MarketplaceAbi.abi,
      signer,
    )
    setMarketplace(marketplace)
    // save marketplace as an account to backend
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "address": MarketplaceAddress.address.toLowerCase()
      })
    };
    saveAccount(requestOptions);
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    setNFT(nft)
    setLoading(false)
  }
  useEffect(async () => {
    try {
      await web3Handler()
    } catch (error) {
      console.log('error', error)
      setLoading(false)
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="App">
        <>
          <Navigation web3Handler={web3Handler} account={account} />
        </>
        <div>
          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
              }}
            >
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className="mx-3 my-0">Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <Home marketplace={marketplace} nft={nft} account={account} />
                }
              />
              <Route
                path="/create"
                element={
                  <Create
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                  />
                }
              />

              <Route
                path="/inventory/:userAccount"
                element={
                  <Inventory
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                  />
                }
              />

              <Route
                path="/nft-detail/:nftId"
                element={
                  <NFTDetail
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                  />
                }
              />
              <Route
                path="/search/:query"
                element={
                  <Search
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                  />
                }
              />


              <Route
                path="/history/:userAccount"
                element={
                  <History
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                  />
                }
              />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
