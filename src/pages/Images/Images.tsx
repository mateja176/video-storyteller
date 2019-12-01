import React from 'react';
import { useSelector } from 'react-redux';
import { selectDictionary } from 'store';

export interface ImagesProps {}

const Images: React.FC<ImagesProps> = () => {
  const dict = useSelector(selectDictionary);

  return <>{dict.images}</>;
};

export default Images;
