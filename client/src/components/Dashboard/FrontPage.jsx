import React from "react";
import { useParams } from "react-router-dom";

export default function FrontPage() {
  const { productId } = useParams();

  return (
    <div>
      <h1>{productId}</h1>
    </div>
  );
}
