import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Row, Col, Card, Button, Badge } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import {
  getMetadata,
  renderCardItem,
  renderLoadingAndError,
  getShortAddress,
} from '../HelperFunction'

export default function Inventory({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true)
  const [notSellingItems, setNotSellingItems] = useState([])
  const [sellingItems, setSellingItems] = useState([])
  const [error, setError] = useState('')
  const { userAccount } = useParams()

  const loadItems = async () => {
    await loadNotSellingItems()
    await loadSellingItems()
    setLoading(false)
  }

  const loadNotSellingItems = async () => {
    let nftOwned = await nft.getAllNFTOwned(userAccount)
    let items = []

    for (let index = 0; index < nftOwned.length; index++) {
      let tokenId = nftOwned[index]
      let metadata = await getMetadata(nft, tokenId)

      items.push({
        tokenId: tokenId.toString(),
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
      })
    }
    setNotSellingItems(items)
  }
  const loadSellingItems = async () => {

    let nftOwned = await marketplace.getAllNFTOwned(userAccount)
    let items = []

    for (let index = 0; index < nftOwned.length; index++) {
      let tokenId = nftOwned[index]
      let itemId = await marketplace.tokenIdToItemId(tokenId)
      let item = await marketplace.itemIdToItem(itemId)

      let metadata = await getMetadata(nft, tokenId)

      items.push({
        tokenId: tokenId.toString(),
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        price: item.price,
        itemId: item.itemId,
      })
    }
    setSellingItems(items)

  }

  useEffect(async () => {
    try {
      await loadItems()
    } catch (error) {
      console.log('error', error)
      setError(error)
      setLoading(false)
    }
  }, [account])

  if (renderLoadingAndError(loading, error))
    return renderLoadingAndError(loading, error)

  return (
    <div>{"Inventory of "}
      <Badge bg="success"> {getShortAddress(userAccount)}</Badge> 
      <div className="flex justify-center">
        {notSellingItems.length > 0 ? (
          <div className="px-5 container">
            <h2>Not On Sale</h2>
            <Row xs={1} md={2} lg={4} className="g-4 py-5">
              {notSellingItems.map((item, idx) => (
                <Col key={idx} className="overflow-hidden">
                  {renderCardItem(item)}
                </Col>
              ))}
            </Row>
          </div>
        ) : (
          <main style={{ padding: '1rem 0' }}>
            <h2>No item not on sale</h2>
          </main>
        )}

        {sellingItems.length > 0 ? (
          <div className="px-5 container">
            <h2>On Sale</h2>
            <Row xs={1} md={2} lg={4} className="g-4 py-5">
              {sellingItems.map((item, idx) => (
                <Col key={idx} className="overflow-hidden">
                  {renderCardItem(item)}
                </Col>
              ))}
            </Row>
          </div>
        ) : (
          <main style={{ padding: '1rem 0' }}>
            <h2>No item on sale</h2>
          </main>
        )}
      </div>
    </div>
  )
}
