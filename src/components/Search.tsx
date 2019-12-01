import { ClickAwayListener, Divider } from '@material-ui/core';
import algoliaSearch from 'algoliasearch';
import React from 'react';
import { Hits, InstantSearch, SearchBox } from 'react-instantsearch-dom';
import { Box, Flex } from 'rebass';
import { createGlobalStyle } from 'styled-components';

const SearchStyle = createGlobalStyle`
  .ais-Hits {
    position: absolute;
    background: white;
    color: black;
  }
  .ais-Hits-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .ais-SearchBox-submit,
  .ais-SearchBox-reset,
  .ais-SearchBox-input {
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .ais-Hits-list,
  .ais-SearchBox-input {
    width: 150px;
  }
  @media only screen and (min-width: 600px) {
    .ais-Hits-list,
    .ais-SearchBox-input {
      width: 200px;
    }
  }
`;

const searchClient = algoliaSearch(
  process.env.REACT_APP_ALGOLIA_APP_ID || '',
  process.env.REACT_APP_ALGOLIA_ADMIN_KEY || '',
);

interface Person {
  name: string;
}

export interface SearchProps {}

const Search: React.FC<SearchProps> = () => {
  const [inFocus, setInFocus] = React.useState(false);

  return (
    <Flex
      mr={2}
      style={{ position: 'relative' }}
      onClick={() => {
        setInFocus(true);
      }}
    >
      <ClickAwayListener
        onClickAway={() => {
          setInFocus(false);
        }}
      >
        <Box>
          <SearchStyle />
          <InstantSearch indexName="dev_people" searchClient={searchClient}>
            <SearchBox
              onSubmit={e => {
                e.preventDefault();
              }}
            />
            {inFocus && (
              <Hits<Person>
                hitComponent={({ hit: { name } }) => (
                  <>
                    <Box p={3}>{name}</Box>
                    <Divider />
                  </>
                )}
              />
            )}
          </InstantSearch>
        </Box>
      </ClickAwayListener>
    </Flex>
  );
};

export default Search;
