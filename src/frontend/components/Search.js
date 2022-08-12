import { useState, useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import {
    getMetadata,
    renderCardItem,
    renderLoadingAndError,
} from '../HelperFunction'
export default function Search({ marketplace, nft, account }) {
    const [loading, setLoading] = useState(true)
    const [nftItems, setNFTItems] = useState([])
    const [error, setError] = useState('')
    const { query } = useParams()
    const [found, setFound] = useState(true)
    const loadMarketplaceItems = async () => {
        const itemCount = await marketplace.itemCount()
        let items = []
        for (let i = 1; i <= itemCount; i++) {
            const item = await marketplace.itemIdToItem(i)
            let metadata = await getMetadata(nft, item.tokenId)
            console.log(query)
            console.log(metadata.name.toLowerCase())
            if ((metadata.name.toLowerCase().includes(query.toLowerCase())) && item.onSale) {
                items.push({
                    price: item.price,
                    itemId: item.itemId,
                    seller: item.seller,
                    tokenId: item.tokenId.toNumber(),
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image,
                })
            }
        }
        console.log(items.length)
        if (items.length === 0) {
            setFound(false)
        }
        setLoading(false)
        setNFTItems(items)
    }

    useEffect(async () => {
        try {
            await loadMarketplaceItems()
        } catch (error) {
            console.log('error', error)
            setError(error)
            setLoading(false)
        }
    }, [])

    if (renderLoadingAndError(loading, error))
        return renderLoadingAndError(loading, error)
    return (
        <div className="flex justify-center">
            {found === true ? (
                <div className="px-5 container">
                    <Row xs={1} md={2} lg={4} className="g-4 py-5">
                        {nftItems.map((item, idx) => (
                            <Col key={idx} className="overflow-hidden">
                                {renderCardItem(item)}
                            </Col>
                        ))}
                    </Row>
                </div>
            ) : (
                <main style={{ padding: '1rem 0' }}>
                    <h2>No Item found</h2>
                </main>
            )}
        </div>
    )
}
