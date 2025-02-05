"use client";


import React from 'react';
import dynamic from 'next/dynamic';

const Product = dynamic(() => import('@/components/landingpage/Product'), {
    ssr: false,
  });

const ProductWrapper = () => {
  return <Product />;
};

export default ProductWrapper;