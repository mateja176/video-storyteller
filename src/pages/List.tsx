import { TextField, Typography, useTheme } from '@material-ui/core';
import { ArrowUpward } from '@material-ui/icons';
import { Button, IconButton, Tooltip } from 'components';
import { name } from 'faker';
import { merge, range } from 'ramda';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  AutoSizer,
  InfiniteLoader,
  List,
  ListRowRenderer,
  WindowScroller,
  IndexRange,
} from 'react-virtualized';
import { Box } from 'rebass';
import { selectDictionary } from 'store';
import { dividingBorder } from 'styles';
import { cache } from 'utils';

export interface Person {
  name: string;
}
export type People = { [index: number]: Person };

const circleWidth = 10;

const createRowRenderer = (list: People): ListRowRenderer => ({
  key,
  index,
  style,
  isScrolling,
  isVisible,
}) => {
  const { name: personsName = '🚧 Not loaded' } = list[index] || {};

  return (
    <div
      key={key}
      style={{
        ...style,
        borderBottom: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
      }}
    >
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Typography style={{ marginRight: 10 }}>
          {index + 1}. {personsName}
        </Typography>
        <div
          style={{
            width: circleWidth,
            height: circleWidth,
            background: isVisible ? 'royalblue' : 'tomato',
            borderRadius: '50%',
          }}
        />
      </div>
      {isScrolling && <Typography variant="caption">Scrolling...</Typography>}
    </div>
  );
};

const rowHeight = 40;

const initialIndexToScrollTo = -1;

const pageSize = 100;

const rowCount = 2000;

const scrollButtonTop = 10;

type ScrollButtonStyle = Required<
  Pick<React.CSSProperties, 'position' | 'left'>
> &
  Pick<React.CSSProperties, 'top'>;

const initialScrollButtonStyle: ScrollButtonStyle = {
  position: 'relative',
  left: 'auto',
  top: 'auto',
};

const loadMore = (getName: () => Person['name']) => (
  rangeToLoad: ReturnType<ReturnType<typeof range>>,
) =>
  rangeToLoad.reduce(
    (people, i) => ({
      ...people,
      [i]: { name: getName() },
    }),
    {} as People,
  );

const loadMorePlaceholders = loadMore(() => 'Loading...');

const loadMorePeople = loadMore(() => name.findName());

export interface ListPageProps {}

const ListPage: React.FC<ListPageProps> = () => {
  const dict = useSelector(selectDictionary);

  const theme = useTheme();

  const [value, setValue] = useState('');

  const listContainer = React.useRef<HTMLDivElement | null>(null);

  const [list, setList] = useState<People>({});

  const [indexToScrollTo, setIndexToScrollTo] = useState(
    initialIndexToScrollTo,
  );

  React.useEffect(() => {
    if (listContainer.current) {
      window.scrollTo({
        top: listContainer.current.offsetTop + indexToScrollTo * rowHeight,
        behavior: 'smooth',
      });
    }
  }, [indexToScrollTo, listContainer]);

  React.useEffect(() => {
    setList(merge(list, loadMorePeople(range(0)(pageSize))));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rowRenderer = createRowRenderer(list);

  const loadMoreRows = ({ startIndex, stopIndex }: IndexRange) => {
    const log = () =>
      console.log('load rows from', startIndex, 'to', stopIndex); // eslint-disable-line no-console
    log();

    const rangeToLoad = range(startIndex)(stopIndex + 1).filter(i => !list[i]);

    const rowsBeingLoaded = loadMorePlaceholders(rangeToLoad);

    setList(merge(list, rowsBeingLoaded));

    return new Promise(resolve => {
      log();

      setList(oldList => merge(oldList, loadMorePeople(rangeToLoad)));

      resolve();
    });
  };

  const scrollButtonRef = React.useRef<HTMLDivElement>(null);

  const [scrollButtonStyle, setScrollButtonStyle] = React.useState<
    ScrollButtonStyle
  >(initialScrollButtonStyle);

  React.useEffect(() => {
    const { left, top } = scrollButtonRef.current!.getBoundingClientRect();

    const cachedSetScrollButtonStyle = cache(setScrollButtonStyle);

    const setStyle = () => {
      if (window.pageYOffset + scrollButtonTop > top) {
        cachedSetScrollButtonStyle({
          position: 'fixed',
          left,
          top: scrollButtonTop,
        });
      } else {
        cachedSetScrollButtonStyle(initialScrollButtonStyle);
      }
    };

    window.addEventListener('scroll', setStyle);

    return () => {
      window.removeEventListener('scroll', setStyle);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();

          const index = Number(value) - 1;
          setIndexToScrollTo(index);
        }}
        style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
      >
        <TextField
          label="Go to index"
          type="number"
          value={value}
          onChange={({ target: { value: newValue } }) => setValue(newValue)}
        />
        <Box ml={2} alignSelf="flex-end">
          <Button type="submit">{dict.submit}</Button>
        </Box>

        <div
          ref={scrollButtonRef}
          style={{
            ...scrollButtonStyle,
            zIndex: 2,
            opacity: 0.7,
            marginLeft: 'auto',
          }}
        >
          <Tooltip title={dict.scrollToTop}>
            <IconButton
              onClick={() => {
                setIndexToScrollTo(
                  indexToScrollTo ? 0 : initialIndexToScrollTo, // * circumvents setter memoization
                );
              }}
              style={{ background: theme.palette.background.paper }}
            >
              <ArrowUpward />
            </IconButton>
          </Tooltip>
        </div>
      </form>
      <br />
      <br />
      <Box ref={listContainer}>
        <InfiniteLoader
          minimumBatchSize={pageSize}
          rowCount={rowCount}
          isRowLoaded={({ index }) => Boolean(list[index])}
          loadMoreRows={loadMoreRows}
        >
          {({ registerChild, onRowsRendered }) => (
            <WindowScroller>
              {({ height, isScrolling, onChildScroll, scrollTop }) => (
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <List
                      ref={registerChild}
                      autoHeight
                      height={height}
                      width={width}
                      onRowsRendered={onRowsRendered}
                      isScrolling={isScrolling}
                      scrollTop={scrollTop}
                      onScroll={onChildScroll}
                      rowHeight={rowHeight}
                      rowCount={rowCount}
                      rowRenderer={rowRenderer}
                      style={{ border: dividingBorder }}
                      scrollToAlignment="start"
                    />
                  )}
                </AutoSizer>
              )}
            </WindowScroller>
          )}
        </InfiniteLoader>
      </Box>
    </div>
  );
};

export default ListPage;
