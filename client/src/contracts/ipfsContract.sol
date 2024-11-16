// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecentralizedFileStorage {

    struct File {
        string fileHash; 
        string fileName; 
        string fileType; 
        string description; 
        address uploader;  
        uint256 timestamp; 
    }

    mapping(string => File) public files;

    event FileUploaded(
        string fileHash,
        string fileName,
        string fileType,
        string description,
        address indexed uploader,
        uint256 timestamp
    );

    function uploadFile(string memory _fileHash, string memory _fileName, string memory _fileType, string memory _description) public {
        require(bytes(_fileHash).length > 0, "File hash is required");
        require(bytes(_fileName).length > 0, "File name is required");
        require(bytes(_fileType).length > 0, "File type is required");
        require(bytes(_description).length > 0, "File description is required");

        files[_fileHash] = File({
            fileHash: _fileHash,
            fileName: _fileName,
            fileType: _fileType,
            description: _description,
            uploader: msg.sender,
            timestamp: block.timestamp
        });

        emit FileUploaded(_fileHash, _fileName, _fileType, _description, msg.sender, block.timestamp);
    }

    function getFile(string memory _fileHash) public view returns (string memory fileName, string memory fileType, string memory description, address uploader, uint256 timestamp ) {
        require(bytes(files[_fileHash].fileHash).length > 0, "File not found");
        
        File memory file = files[_fileHash];
        return (
            file.fileName,
            file.fileType,
            file.description,
            file.uploader,
            file.timestamp
        );
    }
}
