import { Input, Typography, useTheme } from '@material-ui/core';
import { ArrowUpward } from '@material-ui/icons';
import { Button, IconButton, Tooltip } from 'components';
import { name } from 'faker';
import { merge, range } from 'ramda';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  AutoSizer,
  InfiniteLoader,
  InfiniteLoaderProps,
  List,
  ListRowRenderer,
  WindowScroller,
} from 'react-virtualized';
import { selectDictionary } from 'store';
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

type LoadMoreRows = InfiniteLoaderProps['loadMoreRows'];

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

export interface ImagesProps {}

const ImageList: React.FC<ImagesProps> = () => {
  const dict = useSelector(selectDictionary);

  const theme = useTheme();

  const [value, setValue] = useState('');

  const [list, setList] = useState<People>({});

  const [indexToScrollTo, setIndexToScrollTo] = useState(
    initialIndexToScrollTo,
  );

  React.useEffect(() => {
    setList(merge(list, loadMorePeople(range(0)(pageSize))));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rowRenderer = createRowRenderer(list);

  const loadMoreRows: LoadMoreRows = ({ startIndex, stopIndex }) => {
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

          setIndexToScrollTo(Number(value) - 1);
        }}
        style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
      >
        <Input
          type="number"
          value={value}
          onChange={({ target: { value: newValue } }) => setValue(newValue)}
        />
        <Button type="submit">{dict.submit}</Button>
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
              onClick={() => setIndexToScrollTo(0)}
              style={{ background: theme.palette.background.paper }}
            >
              <ArrowUpward />
            </IconButton>
          </Tooltip>
        </div>
      </form>
      <br />
      <br />
      <InfiniteLoader
        minimumBatchSize={pageSize}
        rowCount={rowCount}
        isRowLoaded={({ index }) => Boolean(list[index])}
        loadMoreRows={loadMoreRows}
      >
        {({ registerChild, onRowsRendered }) => (
          <WindowScroller
            onScroll={() => setIndexToScrollTo(initialIndexToScrollTo)}
          >
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
                    rowHeight={40}
                    rowCount={rowCount}
                    rowRenderer={rowRenderer}
                    scrollToIndex={indexToScrollTo}
                    style={{ border: '1px solid #ccc' }}
                    scrollToAlignment="start"
                  />
                )}
              </AutoSizer>
            )}
          </WindowScroller>
        )}
      </InfiniteLoader>
    </div>
  );
};

export default ImageList;
