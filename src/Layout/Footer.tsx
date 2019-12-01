import { Paper } from '@material-ui/core';
// @ts-ignore
import preval from 'babel-plugin-preval/macro';
import React from 'react';
import { Flex } from 'rebass';

const version = preval`
const fs = require('fs');
const path = require('path');

module.exports = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), { encoding: 'UTF-8' })).version;

`;

export interface FooterProps {}

const Footer: React.FC<FooterProps> = () => (
  <Paper>
    <Flex my={2} mx={3} justifyContent="flex-end">
      Version: {version}
    </Flex>
  </Paper>
);

export default Footer;
