import { Box, Button, Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import { t } from "i18next";
import React, { useEffect } from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import config from "../../config";
import useToast from "../../hooks/useToast";

export default function FrontPage() {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const { productId } = useParams();
  const toast = useToast();

  const fetchProductInfo = async () => {
    try {
      const res = await fetch(`${config.serverURL}/get_courses/course/${productId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await res.json();
      if (res.ok) {
        setProduct(body.course);
        document.title = `${body.course.name} - ${body.course.description}`;
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductInfo();
  }, []);

  if (loading) {
    return (
      <Flex w="full" h="full" justify={"center"} align="center">
        <Spinner />
      </Flex>
    );
  }

  if (!product) {
    return (
      <Heading w={"full"} textAlign="center">
        Product not found!
      </Heading>
    );
  }

  return (
    <Box>
      <Heading marginBottom={3} color={"primary"} fontWeight="normal">
        {product.name}
      </Heading>
      <Text marginBottom={3} whiteSpace={"pre-wrap"}>
        {product.frontPageText ? product.frontPageText : "---"}
      </Text>
      <Button
        as={Link}
        to={`/dashboard/quiz/${product._id}`}
        color={"black"}
        colorScheme={"secondary"}
      >
        {t("user_dashboard_learn_button")}
      </Button>
    </Box>
  );
}
