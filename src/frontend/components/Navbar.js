import {
    Link
} from "react-router-dom";
import { Navbar, Nav, Button, Container, Form } from 'react-bootstrap'
import market from '../image/market.png'
import { getShortAddress } from "../HelperFunction";
import { useState } from 'react'


const Navigation = ({ web3Handler, account }) => {
    const [query, setQuery] = useState("")

    return (
        <Navbar expand="lg" bg="secondary" variant="dark">
            <Container>
                <Navbar.Brand href="/">
                    <img src={market} width="40" height="40" className="" alt="" />
                    &nbsp; NFT Marketplace
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/create">Create NFT</Nav.Link>
                        <Nav.Link as={Link} to={"/inventory/" + account}>Inventory</Nav.Link>
                        <Nav.Link as={Link} to={"/history/" + account}>History</Nav.Link>
                    </Nav>
                    <Form className="d-flex">
                        <Form.Control
                            type="search"
                            placeholder="Search"
                            className="me-2"
                            aria-label="Search"
                            onChange={event => setQuery(event.target.value)}
                        />

                        <Link to={"/search/" + query}>
                            <Button variant="outline-light"> Search</Button>
                        </Link>


                    </Form>
                    <Nav>
                        {account ? (
                            <Nav.Link
                                as={Link} to={"/inventory/" + account}
                                // target="_blank"
                                // rel="noopener noreferrer"
                                className="button nav-button btn-sm mx-4">
                                <Button variant="warning">
                                    {getShortAddress(account)}
                                </Button>

                            </Nav.Link>
                        ) : (
                            <Button onClick={web3Handler} variant="outline-light">Connect Wallet</Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )

}

export default Navigation;