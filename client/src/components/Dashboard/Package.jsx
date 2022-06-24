import React from "react";
import { Flex, Heading, SimpleGrid } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useToast from "../../hooks/useToast";
import config from "../../config";
import { useState } from "react";
import { Spinner } from "@chakra-ui/spinner";

export default function Package() {
  const [packageInfo, setPackageInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { packageId } = useParams();

  const packageProducts = (packageInfo && packageInfo.products) || [];

  async function fetchPackageInfo() {
    try {
      const res = await fetch(`${config.serverURL}/package_api/${packageId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        setPackageInfo(body.package);
        setLoading(false);
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    fetchPackageInfo();
  }, []);

  if (loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Flex w="full" h="full" direction={"column"}>
      <Flex mb={5} direction="column">
        <Heading color="primary" fontWeight="normal" fontSize="xl" mb={2}>
          About {packageInfo.name}
        </Heading>
        <Heading fontSize={"md"} fontWeight="normal" whiteSpace="pre-wrap">
          {packageInfo.description}
        </Heading>
      </Flex>

      <Flex direction={"column"}>
        <Heading color="primary" fontWeight="normal" fontSize="xl" mb={5}>
          Products under {packageInfo.name}
        </Heading>
        <SimpleGrid mb={5} columns={[1, 1, 2, 3]} spacing={5}>
          {packageProducts.map((product) => {
            return (
              <Button
                as={Link}
                key={product._id}
                to={`/dashboard/quiz/${product._id}`}
                colorScheme="secondary"
                color={"black"}
                p={10}
                whiteSpace="normal"
                textAlign="center"
                height="auto"
              >
                {product.name}
              </Button>
            );
          })}
        </SimpleGrid>
      </Flex>
    </Flex>
  );
}
