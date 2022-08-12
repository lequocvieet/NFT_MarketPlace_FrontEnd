import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Row, Form, Col, Card, Button, Dropdown, Table } from 'react-bootstrap'
import { saveTransaction, infoTransactionRequest } from '../api/api'
import { Link, useParams } from 'react-router-dom'
import {
  getMetadata,
  isApprovedForAll,
  renderLoadingAndError,
  getShortAddress,
  renderTime,
  getEventTimestamp
} from '../HelperFunction'
import MarketplaceAddress from '../contractsData/Marketplace-address.json'

export default function NFTDetail({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true)
  const [nftItem, setNFTItem] = useState([])
  const [price, setPrice] = useState(null)
  const [receiver, setReceiver] = useState('')
  const [error, setError] = useState('')
  const { nftId } = useParams()
  const [transactionData, setTransactionData] = useState(null)


  const loadItem = async () => {
    let itemId
    let itemBlockchain
    let metadata
    let owner
    let item

    itemId = await marketplace.tokenIdToItemId(nftId)
    // get transaction data from backend
    const url = `http://localhost:9090/api/v1/transaction/get_transaction/?itemId=${itemId}`;
    await fetch(url).then((response) => response.json())
      .then((transactionData) => { setTransactionData(transactionData) });
    itemBlockchain = await marketplace.itemIdToItem(itemId)
    metadata = await getMetadata(nft, nftId)
    owner = await nft.ownerOf(nftId)

    if (itemBlockchain.onSale === false) {
      console.log(owner.toLowerCase())
      item = {
        tokenId: nftId,

        image: metadata.image,
        name: metadata.name,
        description: metadata.description,
        owner: owner.toLowerCase(),
        onSale: false,
      }
      console.log('typeof owner', typeof item.owner, item.owner)
    } else {
      console.log(itemBlockchain.onSale)

      item = {
        tokenId: nftId,

        image: metadata.image,
        name: metadata.name,
        description: metadata.description,

        itemId: itemBlockchain.itemId.toString(),
        price: ethers.utils.formatUnits(itemBlockchain.price, 'wei'),
        seller: itemBlockchain.seller.toLowerCase(),
        onSale: true,
      }
      console.log('typeof', typeof item.seller)
    }

    setLoading(false)
    setNFTItem(item)
  }
  const buyMarketItem = async () => {
    await (
      await marketplace.purchaseItem(nftItem.itemId, { value: nftItem.price })
    ).wait()
    loadItem()

    //Listen buy event
    const filter = marketplace.filters.BuyItem(
      null,
      null,
      null,
      null,
      null,
      account,
    )
    const results = await marketplace.queryFilter(filter)
    let buyEvent = await results.pop();
    let time = renderTime(await getEventTimestamp(buyEvent));
    buyEvent = buyEvent.args
    console.log(time)
    //post transaction data to backend
    const saveTransactionRequest = infoTransactionRequest("buy", buyEvent.seller, account, time, buyEvent.tokenId.toString(), ethers.utils.formatEther(nftItem.price))
    const transactionId = saveTransaction(saveTransactionRequest);
  }
  const cancelItem = async () => {
    await isApprovedForAll(nft, account, marketplace)
    await (await marketplace.cancelItem(nftItem.itemId)).wait()
    loadItem()
    //Listen cancel event
    const filter = marketplace.filters.CancelItem(null, null, null, account)
    const results = await marketplace.queryFilter(filter)
    let cancelEvent = await results.pop();
    let time = renderTime(await getEventTimestamp(cancelEvent));
    cancelEvent = cancelEvent.args
    console.log(time)
    //post transaction data to backend
    const saveTransactionRequest = infoTransactionRequest("cancel", MarketplaceAddress.address, account, time, cancelEvent.tokenId.toString(), "")
    const transactionId = saveTransaction(saveTransactionRequest);
  }
  const sellItem = async () => {
    await isApprovedForAll(nft, account, marketplace)

    const listingPrice = ethers.utils.parseEther(price.toString())
    await (
      await marketplace.makeItem(nft.address, nftItem.tokenId, listingPrice)
    ).wait()
    loadItem()

    //listen makeItem event
    const filter = marketplace.filters.MakeItem(
      null,
      null,
      null,
      null,
      account,
    )
    const results = await marketplace.queryFilter(filter)
    let makeItemEvent = await results.pop();
    let time = renderTime(await getEventTimestamp(makeItemEvent));
    makeItemEvent = makeItemEvent.args
    console.log(time)

    //post transaction data to backend
    const saveTransactionRequest = infoTransactionRequest("sell", account, MarketplaceAddress.address, time, makeItemEvent.tokenId.toString(), price.toString())
    const transactionId = saveTransaction(saveTransactionRequest);
  }
  const giftNFT = async () => {
    await isApprovedForAll(nft, account, marketplace)
    await (
      await marketplace.giftNFT(nft.address, receiver, nftItem.tokenId)
    ).wait()
    loadItem()
    //Listen giftNFT event
    const filter = marketplace.filters.GiftNFT(null, account, null, null)
    const results = await marketplace.queryFilter(filter)
    let giftNFTEvent = await results.pop();
    let time = renderTime(await getEventTimestamp(giftNFTEvent));
    giftNFTEvent = giftNFTEvent.args
    console.log(time)

    //post transaction data to backend
    const saveTransactionRequest = infoTransactionRequest("gift", account, giftNFTEvent.to, time, giftNFTEvent.tokenId.toString(), "")
    const transactionId = saveTransaction(saveTransactionRequest);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    try {
      await loadItem()
    } catch (error) {
      console.log('error', error)
      setError(error)
      setLoading(false)
    }
  }, [])

  if (renderLoadingAndError(loading, error))
    return renderLoadingAndError(loading, error)

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: '1000px' }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Col md={6}>
                {nftItem.onSale ? (
                  <Card>
                    <Card.Img variant="top" src={nftItem.image} />
                    <Card.Body color="secondary">
                      <Card.Title>TokenID: {nftItem.tokenId}</Card.Title>
                      <Card.Title>Name: {nftItem.name}</Card.Title>
                      <Card.Text>Description: {nftItem.description}</Card.Text>
                      <Card.Title>
                        Price: {ethers.utils.formatEther(nftItem.price)} ETH
                      </Card.Title>
                      <Card.Title>
                        <Dropdown>
                          {"Owner: "}
                          <Dropdown.Toggle variant="outline-dark" id="dropdown-basic">
                            {getShortAddress(nftItem.seller)}
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item> <Link to={'/history/' + nftItem.seller}>To account's History</Link></Dropdown.Item>
                            <Dropdown.Item> <Link to={'/inventory/' + nftItem.seller}>To account's Inventory</Link></Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </Card.Title>
                    </Card.Body>
                    {nftItem.seller.toLowerCase() !== account ? (
                      <Card.Footer>
                        <div className="d-grid">
                          <Button
                            onClick={() => buyMarketItem(nftItem)}
                            variant="primary"
                            size="lg"
                          >
                            Buy for {ethers.utils.formatEther(nftItem.price)} ETH
                          </Button>
                        </div>
                      </Card.Footer>
                    ) : (
                      <Card.Footer>
                        <div className="d-grid">
                          <Button
                            onClick={() => cancelItem(nftItem)}
                            variant="danger"
                            size="lg"
                          >
                            Cancel Sale
                          </Button>
                        </div>
                      </Card.Footer>
                    )}
                  </Card>
                ) : (
                  <Card>
                    <Card.Img variant="top" src={nftItem.image} />
                    <Card.Body color="secondary">
                      <Card.Title>TokenID: {nftItem.tokenId}</Card.Title>
                      <Card.Title>Name: {nftItem.name}</Card.Title>
                      <Card.Title>Description: {nftItem.description}</Card.Title>
                      <Card.Title>
                        <Dropdown>
                          {"Owner: "}
                          <Dropdown.Toggle variant="outline-dark" id="dropdown-basic">
                            {getShortAddress(nftItem.owner)}
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item> <Link to={'/history/' + nftItem.owner}>To account's History</Link></Dropdown.Item>
                            <Dropdown.Item> <Link to={'/inventory/' + nftItem.owner}>To account's Inventory</Link></Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </Card.Title>

                      {nftItem.owner === account ? (
                        <Row>
                          <Form.Control
                            onChange={(e) => setPrice(e.target.value)}
                            size="lg"
                            required
                            type="number"
                            placeholder="Price in ETH"
                          />
                          <Button onClick={sellItem} variant="primary" size="lg">
                            Sell
                          </Button>
                          <Form.Control
                            onChange={(e) => setReceiver(e.target.value)}
                            size="lg"
                            required
                            type="string"
                            placeholder="Receiver's address"
                          />
                          <Button onClick={giftNFT} variant="warning" size="lg">
                            Gift
                          </Button>
                        </Row>
                      ) : (
                        <div></div>
                      )}
                    </Card.Body>
                  </Card>
                )}
              </Col>
              <Col sm={6}>
                <div>
                  <h3>Item Event History Table</h3>
                </div>
                <Table striped bordered hover>

                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Price</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      transactionData.map((event) => (
                        <tr key={event.id}>
                          <td>{event.event}</td>
                          <td>{event.currentPrice}</td>
                          <td>{getShortAddress(event.fromAccount)}</td>
                          <td>{getShortAddress(event.toAccount)}</td>
                          <td>{event.time}</td>
                        </tr>

                      ))
                    }
                  </tbody>
                </Table>
              </Col>
            </Row>
          </div>
        </main>
      </div>
    </div>
  )
}

