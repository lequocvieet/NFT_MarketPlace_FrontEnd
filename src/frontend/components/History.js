import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Row, Card, Badge } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import {
  getEventTimestamp,
  getMetadata,
  getShortAddress,
  renderLoadingAndError,
} from '../HelperFunction'

function compareEventByTime(a, b) {
  if (a.time < b.time) {
    return 1
  }
  if (a.time > b.time) {
    return -1
  }
  return 0
}

function renderTime(epochTime) {
  let today = new Date(epochTime * 1000)
  let time = today.getHours() + ':' + today.getMinutes()

  return { date: today.toDateString().slice(4), time }
}

function getLine(event, pov) {

  switch (event.type) {
    case 'make':
      return (
        <span>
          {pov + ' attempted to make sale on '}
          <Link to={'/nft-detail/' + event.tokenId}>
            <span>{event.name}</span>
          </Link>
          {' for ' + ethers.utils.formatEther(event.price) + ' ETH'}
        </span>
      );
    case 'cancel':
      return (
        <span>
          {pov + ' attempted to cancel on '}
          <Link to={'/nft-detail/' + event.tokenId}>
            <span>{event.name}</span>
          </Link>
        </span>
      )
    case 'buy':
      return (
        <span>
          {pov + ' attempted to buy '}
          <Link to={'/nft-detail/' + event.tokenId}>
            <span>{event.name}</span>
          </Link>
          {' from '}
          <Link to={'/history/' + event.seller}>
            <span>{getShortAddress(event.seller)}</span>
          </Link>
          {' for ' + ethers.utils.formatEther(event.price) + ' ETH'}
        </span>
      )
    case 'gift':
      return (
        <span>
          {pov + ' attempted to gift '}
          <Link to={'/nft-detail/' + event.tokenId}>
            <span>{event.name}</span>
          </Link>
          {' to '}
          <Link to={'/history/' + event.receiver}>
            <span>{getShortAddress(event.receiver)}</span>
          </Link>
        </span>
      )
    case 'mint':
      return (
        <span>
          {pov + ' attempted to mint '}
          <Link to={'/nft-detail/' + event.tokenId}>
            <span>{event.name}</span>
          </Link>
        </span>
      );
  }
}

function renderEvent(event, myAccount, accountLooked) {
  let line
  let pov
  myAccount.toLowerCase() === accountLooked.toLowerCase()
    ? (pov = 'You')
    : (pov = getShortAddress(accountLooked))

  line = getLine(event, pov)

  return (
    <>
      <Card>
        <Card.Title>{renderTime(event.time).date} </Card.Title>
        <Card.Body>
          {renderTime(event.time).time + ' : '}
          {line}
        </Card.Body>
      </Card>
    </>
  )
}

export default function History({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')
  const { userAccount } = useParams()

  const listenMakeItem = async () => {
    const filter = marketplace.filters.MakeItem(
      null,
      null,
      null,
      null,
      userAccount,
    )
    const results = await marketplace.queryFilter(filter)

    const madeItem = await Promise.all(
      results.map(async (event) => {
        let time = await getEventTimestamp(event)

        event = event.args
        let metadata = await getMetadata(nft, event.tokenId)

        let item = {
          time,
          type: 'make',
          tokenId: event.tokenId.toString(),
          itemId: event.itemId.toString(),
          price: event.price.toString(),
          seller: event.seller,

          name: metadata.name,
        }

        return item
      }),
    )
    return madeItem
  }
  const listenCancelItem = async () => {
    const filter = marketplace.filters.CancelItem(null, null, null, userAccount)
    const results = await marketplace.queryFilter(filter)

    const canceledItem = await Promise.all(
      results.map(async (event) => {
        let time = await getEventTimestamp(event)
        event = event.args
        let metadata = await getMetadata(nft, event.tokenId)
        let item = {
          time,
          type: 'cancel',
          tokenId: event.tokenId.toString(),
          itemId: event.itemId.toString(),
          onwer: event.owner,
          name: metadata.name,
        }

        return item
      }),
    )
    return canceledItem
  }
  const listenBuyItem = async () => {
    const filter = marketplace.filters.BuyItem(
      null,
      null,
      null,
      null,
      null,
      userAccount,
    )
    const results = await marketplace.queryFilter(filter)

    const boughtItem = await Promise.all(
      results.map(async (event) => {
        let time = await getEventTimestamp(event)

        event = event.args
        let metadata = await getMetadata(nft, event.tokenId)

        let item = {
          time,
          type: 'buy',
          tokenId: event.tokenId.toString(),
          itemId: event.itemId.toString(),
          price: event.price.toString(),
          seller: event.seller,
          buyer: userAccount,
          name: metadata.name,
        }

        return item
      }),
    )
    return boughtItem
  }
  const listenGiftNFT = async () => {
    const filter = marketplace.filters.GiftNFT(null, userAccount, null, null)
    const results = await marketplace.queryFilter(filter)

    const giftedNFT = await Promise.all(
      results.map(async (event) => {
        let time = await getEventTimestamp(event)

        event = event.args
        let metadata = await getMetadata(nft, event.tokenId)

        let item = {
          time,
          type: 'gift',
          tokenId: event.tokenId.toString(),

          gifter: event.from,
          receiver: event.to,
          name: metadata.name,
        }

        return item
      }),
    )
    return giftedNFT
  }
  const listenMintNFT = async () => {
    //    event MintNFT(address indexed to, string uri, uint256 tokenId);
    const filter = nft.filters.MintNFT(userAccount, null, null)
    const results = await nft.queryFilter(filter)

    const mintedNFT = await Promise.all(
      results.map(async (event) => {
        let time = await getEventTimestamp(event)

        event = event.args
        let metadata = await getMetadata(nft, event.tokenId)

        let item = {
          time,
          type: 'mint',
          tokenId: event.tokenId.toString(),

          minter: event.to,
          name: metadata.name,
        }

        return item
      }),
    )
    return mintedNFT
  }
  const loadHistory = async () => {
    let events = []

    let makeItemEvent = await listenMakeItem()
    let cancelItemEvent = await listenCancelItem()
    let buyItemEvent = await listenBuyItem()
    let giftNFTEvent = await listenGiftNFT()
    let mintNFTEvent = await listenMintNFT()

    makeItemEvent.map((event) => {
      events.push(event)
    })
    cancelItemEvent.map((event) => {
      events.push(event)
    })
    buyItemEvent.map((event) => {
      events.push(event)
    })
    giftNFTEvent.map((event) => {
      events.push(event)
    })
    mintNFTEvent.map((event) => {
      events.push(event)
    })
    events.sort(compareEventByTime)

    console.log(events)

    setLoading(false)
    setEvents(events)
  }

  useEffect(async () => {
    try {
      await loadHistory()
    } catch (error) {
      console.log('error', error)
      setError(error)
      setLoading(false)
    }
  }, [userAccount])

  if (renderLoadingAndError(loading, error))
    return renderLoadingAndError(loading, error)
  return (
    <div className="flex justify-center">

      <div> History of <Badge bg="success"> {getShortAddress(userAccount)}</Badge>
        {events.length > 0 ? (
          <div className="px-5 py-3 container">
            <h2>History</h2>
            <Row className="g-4">
              {events.map((event, idx) =>
                renderEvent(event, idx, account, userAccount),
              )}
            </Row>
          </div>
        ) : (
          <main style={{ padding: '1rem 0' }}>
            <h2>No history</h2>
          </main>
        )}
      </div>
    </div>
  )
}
