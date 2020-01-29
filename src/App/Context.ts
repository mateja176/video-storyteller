import React from 'react';

export type DeleteAll = () => void;
export type IContext = {
  deleteAll: DeleteAll;
  setDeleteAll: (deleteAll: DeleteAll) => void;
};

export const initialContext: IContext = {
  deleteAll: () => {},
  setDeleteAll: () => {},
};

export const Context = React.createContext<IContext>(initialContext);
