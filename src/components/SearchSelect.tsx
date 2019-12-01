import { useTheme } from '@material-ui/core';
import { Search as SearchIcon } from '@material-ui/icons';
import { Maybe } from 'models';
import React from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { Flex } from 'rebass';
import { selectDictionary } from 'store';

const labels = [
  'Afghanistan',
  'Aland Islands',
  'Albania',
  'Algeria',
  'American Samoa',
  'Andorra',
  'Angola',
  'Anguilla',
  'Antarctica',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Aruba',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bermuda',
  'Bhutan',
  'Bolivia, Plurinational State of',
  'Bonaire, Sint Eustatius and Saba',
  'Bosnia and Herzegovina',
  'Botswana',
  'Bouvet Island',
  'Brazil',
  'British Indian Ocean Territory',
  'Brunei Darussalam',
] as const;

const options = labels.map(label => ({
  label,
  value: label,
}));

type Option = typeof options[number];

export interface SearchSelectProps {}

const SearchSelect: React.FC<SearchSelectProps> = () => {
  const theme = useTheme();

  const white = (base: React.CSSProperties) => ({
    ...base,
    color: theme.palette.common.white,
  });

  const dictionary = useSelector(selectDictionary);

  const [value, setValue] = React.useState<Maybe<Option>>(null);

  return (
    <Flex
      alignItems="center"
      style={{ position: 'relative' }}
      mr={2}
      width={[150, 250]}
    >
      <SearchIcon
        style={{
          position: 'absolute',
          zIndex: 2,
          left: 10,
        }}
      />
      <Select
        placeholder={`${dictionary.search}...`}
        options={options}
        value={value}
        onChange={newValue => {
          setValue(newValue as Option);
        }}
        styles={{
          container: base => ({
            ...base,
            flexGrow: 1,
            color: theme.palette.common.black,
          }),
          control: base => ({
            ...base,
            paddingLeft: 30,
            border: 'none',
            backgroundColor: theme.palette.primary.light,
          }),
          singleValue: white,
          input: white,
          dropdownIndicator: white,
          placeholder: white,
        }}
      />
    </Flex>
  );
};

export default SearchSelect;
