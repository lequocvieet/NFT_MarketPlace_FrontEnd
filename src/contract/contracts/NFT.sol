// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    event MintNFT(address indexed to, string uri, uint256 tokenId);
    uint256 public tokenCount;

    constructor() ERC721("DApp NFT", "DAPP") {}

    function mint(string memory _tokenURI) external returns (uint256) {
        tokenCount++;
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, _tokenURI);
        emit MintNFT(msg.sender, tokenURI(tokenCount), tokenCount);
        return (tokenCount);
    }

    function getAllNFTOwned(address owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 totalOwned = balanceOf(owner);

        uint256[] memory res = new uint256[](totalOwned);

        if (totalOwned == 0) return res;
        uint256 count = 0;
        for (uint256 i = 1; i <= tokenCount; i++) {
            if (ownerOf(i) == owner) {
                res[count] = i;
                count++;
            }
            if (totalOwned == count) break;
        }
        return res;
    }
}
