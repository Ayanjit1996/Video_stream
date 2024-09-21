import React, { useState } from "react";

function Search({ setSerachTerm }) {
    const [searchText, setSearchText] = useState("");

    const handleInputChange = (event) => {
        const value = event.target.value;
        setSearchText(value);
        setSerachTerm(value);
    };

    return (
        <div className="Search">
            <form className="d-flex" role="search">
                <input
                    className="form-control"
                    type="search"
                    placeholder="Search dialogue"
                    aria-label="Search"
                    value={searchText}
                    onChange={handleInputChange}
                />
            </form>
        </div>
    );
}

export default Search;