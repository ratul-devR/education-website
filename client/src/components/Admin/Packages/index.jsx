import React from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { IconButton, Spinner, Text } from "@chakra-ui/react";
import CreatePackageModal from "./CreatePackageModal";
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";
import { useEffect } from "react";
import useToast from "../../../hooks/useToast";
import config from "../../../config";
import { useState } from "react";
import { FiTrash as DeleteIcon } from "react-icons/fi";

export default function Packages() {
  const [allPackages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  async function fetchPackages(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/package_api`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
      });
      const body = await res.json();

      if (res.ok) {
        setPackages(body.packages);
        setLoading(false);
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  async function deletePackage(packageId) {
    const confirmed = window.confirm("Are you sure, You want to delete this package?");
    if (confirmed) {
      try {
        const res = await fetch(`${config.serverURL}/package_api/delete_package/${packageId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const body = await res.json();

        if (res.ok) {
          setPackages((pre) => pre.filter((item) => item._id !== body.package._id));
          toast({ status: "success", description: body.msg });
        } else {
          toast({ status: "error", description: body.msg });
        }
      } catch (err) {
        toast({ status: "error", description: err.message });
      }
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    fetchPackages(abortController);

    return () => abortController.abort();
  }, []);

  if (loading) {
    return (
      <Flex w="full" h="full" justify={"center"} align="center">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Flex direction={"column"}>
      <Flex mb={3} direction="column">
        <Heading color="primary" fontWeight="normal" fontSize="2xl" mb={3}>
          Packages
        </Heading>
        <Text mb={3} color="GrayText">
          Packages containing multiple products
        </Text>
        <CreatePackageModal setPackages={setPackages} />
      </Flex>
      <Table>
        <Thead>
          <Th>Name</Th>
          <Th>Products</Th>
          <Th>Price</Th>
          <Th>Actions</Th>
        </Thead>
        <Tbody>
          {allPackages.map((item) => {
            return (
              <Tr key={item._id}>
                <Td>{item.name}</Td>
                <Td>
                  {item.products.map((product, index) => {
                    return (
                      <span key={product._id}>
                        {product.name}
                        {index + 1 !== item.products.length ? ", " : null}
                      </span>
                    );
                  })}
                </Td>
                <Td>{item.price}</Td>
                <Td>
                  <IconButton
                    onClick={() => deletePackage(item._id)}
                    colorScheme={"red"}
                    icon={<DeleteIcon />}
                  />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Flex>
  );
}
