import React, { useEffect, useState } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/modal";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Textarea } from "@chakra-ui/textarea";
import useToast from "../../../hooks/useToast";
import config from "../../../config";
import { List, ListItem } from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/checkbox";
import validator from "validator";

const packageInitialState = {
  name: "",
  description: "",
  price: "",
  products: [],
};

export default function CreatePackageModal({ setPackages }) {
  const [packageData, setPackage] = useState(packageInitialState);
  const [products, setProducts] = useState([]);
  const [processing, setProcessing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  async function fetchProducts() {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/raw_categories`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        setProducts(body.categories);
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  async function createPackage() {
    setProcessing(true);
    try {
      const res = await fetch(`${config.serverURL}/package_api/create_package`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(packageData),
      });
      const body = await res.json();

      if (res.ok) {
        setPackages((pre) => [...pre, body.package]);
        closeModal();
        toast({ status: "success", description: body.msg });
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
    setProcessing(false);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    if (name !== "products") {
      setPackage((pre) => ({ ...pre, [name]: value }));
    }
  }

  function handleProductListChange(e) {
    const { checked, value } = e.target;

    if (checked) {
      setPackage((pre) => ({ ...pre, products: [...pre.products, value] }));
    } else {
      setPackage((pre) => ({
        ...pre,
        products: pre.products.filter((product) => product !== value),
      }));
    }
  }

  function closeModal() {
    setPackage(packageInitialState);
    onClose();
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Flex direction="column" display="inline-block" mr={3}>
      <Button onClick={onOpen} colorScheme={"secondary"} color="black">
        Create new package
      </Button>
      <Modal scrollBehavior="inside" isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Crete package</ModalHeader>
          <ModalBody>
            <Input
              name="name"
              onChange={handleInputChange}
              value={packageData.name}
              mb={3}
              placeholder="Package name"
            />
            <Textarea
              name="description"
              onChange={handleInputChange}
              value={packageData.description}
              mb={3}
              placeholder="Package description"
            />
            <Input
              type={"number"}
              placeholder="Price"
              min={0}
              name="price"
              onChange={handleInputChange}
              value={packageData.price}
              mb={3}
            />
            <List>
              <Heading fontSize={"md"} mb={2} color={"GrayText"} fontWeight="normal">
                Products included in this package
              </Heading>
              {products.map((product) => {
                return (
                  <ListItem key={product._id}>
                    <Checkbox value={product._id} onChange={handleProductListChange}>
                      {product.name}
                    </Checkbox>
                  </ListItem>
                );
              })}
            </List>
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeModal} mr={3} variant="ghost">
              Close
            </Button>
            <Button
              disabled={
                validator.isEmpty(packageData.name, { ignore_whitespace: true }) ||
                validator.isEmpty(packageData.description, { ignore_whitespace: true }) ||
                validator.isEmpty(packageData.price, { ignore_whitespace: true }) ||
                !packageData.products.length ||
                processing
              }
              onClick={createPackage}
              colorScheme={"blue"}
            >
              {processing ? "Processing..." : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
