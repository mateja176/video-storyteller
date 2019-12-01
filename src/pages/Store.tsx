/* eslint-disable camelcase */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@material-ui/core';
import { startCase } from 'lodash';
import { Maybe } from 'models';
import React, { FC, useEffect, useRef, useState } from 'react';
import { CreditCard, IceCream } from 'react-kawaii';
import { useSelector } from 'react-redux';
import { Box, Flex } from 'rebass';
import { selectDictionary } from 'store';
import { v4 } from 'uuid';

const product = {
  id: v4(),
  description: 'Ice cream',
  price: 10.0,
  currency: 'USD',
};

type Product = typeof product;

interface Order {
  create_time: string;
  update_time: string;
  id: string;
  intent: string;
  status: string;
  payer: {
    email_address: string;
    payer_id: string;
    address: {
      country_code: string;
      name: { given_name: string; surname: string };
    };
  };
  purchase_units: {
    description: string;
    reference_id: string;
    soft_descriptor: string;
    amount: {};
    payee: {};
    shipping: {};
    payments: {};
  }[];
  links: {
    href: string;
    rel: string;
    method: string;
    title: string;
  }[];
}

const ItemsTable: React.FC<{ items: Array<Order | Product> }> = ({ items }) => (
  <Table>
    <TableHead>
      <TableRow>
        {Object.entries(items[0])
          .filter(([, value]) => typeof value !== 'function')
          .filter(([key]) => key !== 'id')
          .map(([key]) => key)
          .map(key => (
            <TableCell key={key}>{startCase(key)}</TableCell>
          ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {items.map(({ id, ...item }) => (
        <TableRow key={id}>
          {Object.values(item)
            .map(value => JSON.stringify(value, null, 2))
            .map(value => (
              <TableCell key={value}>
                <pre>{value}</pre>
                {/* {typeof value === 'object' ? (
                  <ItemsTable items={[value]} />
                ) : (
                  value
                )} */}
              </TableCell>
            ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export interface StoreProps {}

const Store: FC<StoreProps> = () => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<Maybe<Order>>(null);

  const dict = useSelector(selectDictionary);

  useEffect(() => {
    (window as any).paypal
      .Buttons({
        createOrder: (_: any, actions: any) =>
          actions.order.create({
            purchase_units: [
              {
                description: product.description,
                amount: {
                  currency_code: product.currency,
                  value: product.price,
                },
              },
            ],
          }),
        onApprove: (_: any, actions: any) =>
          actions.order.capture().then((approvedOrder: Order) => {
            setOrder(approvedOrder);
          }),
      })
      .render(paypalRef.current);
  }, []);

  const theme = useTheme();

  return (
    <Box>
      {order ? (
        <div style={{ display: 'grid', justifyItems: 'center' }}>
          <Flex mb={4} flexDirection="column" style={{ textAlign: 'center' }}>
            <Typography variant="h2">{dict.purchased}</Typography>
            <Typography
              variant="h2"
              style={{ color: theme.colors.success.dark }}
            >
              {order.purchase_units[0].description}
            </Typography>
          </Flex>
          <CreditCard mood="happy" color={theme.colors.success.light} />
        </div>
      ) : (
        <Box mx={3}>
          <Flex flexDirection={['column', 'row']} mb={4}>
            <Box mr={[0, 4]} alignSelf={['center', 'flex-start']} mb={[3, 0]}>
              <IceCream />
            </Box>
            <ItemsTable items={[product]} />
          </Flex>
          <div style={{ display: 'grid', justifyItems: 'center' }}>
            <Box width={['100%', '100%', '50%']} ref={paypalRef} />
          </div>
        </Box>
      )}
    </Box>
  );
};

export default Store;
