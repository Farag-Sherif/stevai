"use client";
import { useContextElement } from "@/context/Context";
import { products41 } from "@/data/products";
import Image from "@/components/common/CompatImage";
import React, { useState } from "react";
import QuantitySelect from "./QuantitySelect";
import SizeSelect2 from "./SideSelect2";

export default function ProductStikyBottom() {
  const {
    addProductToCart,
    isAddedToCartProducts,

    cartProducts,
    updateQuantity,
  } = useContextElement();
  const [quantity, setQuantity] = useState(1); // Initial quantity is 1

  return <></>;
}
