import { Box, Paper } from '@material-ui/core';
// @ts-ignore
import preval from 'babel-plugin-preval/macro';
import React from 'react';

const version = preval`
const fs = require('fs');
const path = require('path');

module.exports = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../package.json'), { encoding: 'UTF-8' })).version;

`;

export interface FooterProps {}

const Footer: React.FC<FooterProps> = () => (
  <Paper style={{ display: 'none' }}>
    <Box display="flex" my={2} mx={3} justifyContent="flex-end">
      Version: {version}
    </Box>
  </Paper>
);

export default Footer;
