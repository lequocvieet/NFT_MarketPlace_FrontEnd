// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

//TODO: bidding

//TODO: clean code
//TODO: fix UI

//TODO: responsive when change wallet like "/nft-detail/" page
//TODO: migrate to backend
//TODO: handle error

//TODO: popup when transaction

contract Marketplace is ReentrancyGuard {
    address payable public immutable feeAccount; // the account that receives fees
    uint256 public immutable feePercent; // the fee percentage on sales
    uint256 public itemCount;

    struct Item {
        uint256 itemId;
        IERC721 nft;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        bool onSale;
    }

    mapping(uint256 => Item) public itemIdToItem;
    mapping(uint256 => uint256) public tokenIdToItemId;

    event MakeItem(
        uint256 itemId,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed seller
    );
    event CancelItem(
        uint256 itemId,
        address indexed nft,
        uint256 tokenId,
        address indexed owner
    );

    event BuyItem(
        uint256 itemId,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );
    event GiftNFT(
        address indexed nft,
        address indexed from,
        address indexed to,
        uint256 tokenId
    );

    constructor(uint256 _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    function makeItem(
        IERC721 _nft,
        uint256 _tokenId,
        uint256 _price
    ) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");
        Item memory item;

        itemCount++;

        item.itemId = itemCount;
        item.nft = _nft;
        item.tokenId = _tokenId;
        item.price = _price;
        item.seller = payable(msg.sender);
        item.onSale = true;

        itemIdToItem[itemCount] = item;
        tokenIdToItemId[_tokenId] = itemCount;

        _nft.transferFrom(msg.sender, address(this), _tokenId);

        emit MakeItem(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    function cancelItem(uint256 itemId) external {
        Item memory item = itemIdToItem[itemId];
        require(msg.sender == item.seller, "Not the owner");
        itemIdToItem[itemId].onSale = false;

        IERC721(item.nft).transferFrom(address(this), msg.sender, item.tokenId);

        emit CancelItem(itemId, address(item.nft), item.tokenId, msg.sender);
    }

    function purchaseItem(uint256 _itemId) external payable nonReentrant {
        Item storage item = itemIdToItem[_itemId];

        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(msg.value >= item.price, "not enough ether buy");
        require(item.onSale, "item already sold");

        uint256 fee = (item.price * feePercent) / 100;
        uint256 forSeller = item.price - fee;

        itemIdToItem[_itemId].onSale = false;

        item.seller.transfer(forSeller);
        feeAccount.transfer(fee);

        item.nft.transferFrom(address(this), msg.sender, item.tokenId);

        emit BuyItem(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    function giftNFT(
        address nft,
        address to,
        uint256 tokenId
    ) public {
        IERC721(nft).transferFrom(msg.sender, to, tokenId);
        emit GiftNFT(nft, msg.sender, to, tokenId);
    }

    function getAllNFTOwned(address owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 totalCount = _getCountAllNFTOwned(owner);
        uint256[] memory res = new uint256[](totalCount);
        uint256 count = 0;
        for (uint256 i = 1; i <= itemCount; i++) {
            Item memory item = itemIdToItem[i];
            if (item.seller == owner && item.onSale) {
                res[count] = item.tokenId;
                count++;
            }
            if (totalCount == count) break;
        }
        return res;
    }

    function _getCountAllNFTOwned(address owner)
        internal
        view
        returns (
            uint256 //
        )
    {
        uint256 count = 0;
        for (uint256 i = 1; i <= itemCount; i++) {
            Item memory item = itemIdToItem[i];
            if (item.seller == owner && item.onSale) {
                count++;
            }
        }
        return count;
    }

    function getTotalPrice(uint256 _itemId) public view returns (uint256) {
        return ((itemIdToItem[_itemId].price * (100 + feePercent)) / 100);
    }
}
