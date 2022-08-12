import { Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

export function getShortAddress(address) {
  if (!address) return "no owner";
  return address.slice(0, 5) + "..." + address.slice(38);
}
export function renderTime(epochTime) {
  let today = new Date(epochTime * 1000)
  let time = today.toDateString().slice(4) + " " + today.getHours() + ':' + today.getMinutes()
  return time
}

export function renderCardItem(item) {
  if (!item) return;
  return (
    <Card style={{ height: "auto", width: "16rem", borderRadius: "10px", boxShadow: " 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)" }} bg="dark" border="info">
      <Link to={"/nft-detail/" + item.tokenId}>
        <Card.Img variant="top" style={{ display: "block", height: "16rem", width: "16rem", borderRadius: "10px", "padding": "5px", objectFit: 'contain' }} src={item.image} />
        <Card.Body>
          <Card.Title style={{ fontWeight: "bold" }} >{item.name}</Card.Title>
          {"price" in item ? (
            <Card.Text style={{ color: "red" }}>
              Price: {ethers.utils.formatEther(item.price)} ETH
            </Card.Text>
          ) : (
            <Card.Text></Card.Text>
          )}
        </Card.Body>
      </Link>
    </Card>
  );
}
export function renderLoadingAndError(loading, error) {
  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );
  if (error)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>This Page is error: {error.data.message}</h2>
      </main>
    );
  return null;
}

//async function

export async function isApprovedForAll(nft, account, marketplace) {
  if (!(await nft.isApprovedForAll(account, marketplace.address))) {
    await (await nft.setApprovalForAll(marketplace.address, true)).wait();
  }
}

export async function getEventTimestamp(eventResult) {
  const blockDetail = await eventResult.getBlock();
  return blockDetail.timestamp;
}
export async function getMetadata(nft, tokenId) {
  const uri = await nft.tokenURI(tokenId);
  const response = await fetch(uri);
  const metadata = await response.json();

  return metadata;
}
