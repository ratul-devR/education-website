import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  IconButton,
  Input,
  Textarea,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { FiEdit } from "react-icons/fi";
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
import { useState } from "react";
import useToast from "../../../hooks/useToast";
import validator from "validator";
import config from "../../../config";

export default function EditPackageModal({ item, setPackages }) {
  const [packageInfo, setPackageInfo] = useState(item);
  const [products, setProducts] = useState([]);
  const [processing, setProcessing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  async function fetchProducts() {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/categories`, {
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

  async function updatePackage() {
    setProcessing(true);
    try {
      const res = await fetch(`${config.serverURL}/package_api/update_package/${packageInfo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ updatedPackage: packageInfo }),
      });
      const body = await res.json();

      if (res.ok) {
        setPackages((pre) =>
          pre.map((item) => {
            if (item._id === body.package._id) {
              item = body.package;
            }
            return item;
          })
        );
        setPackageInfo({
          ...body.package,
          products: body.package.products.map((product) => product._id),
        });
        onClose();
        toast({ status: "success", description: body.msg });
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
    setProcessing(false);
  }

  function closeModal() {
    setPackageInfo(item);
    onClose();
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    if (name !== "products") {
      setPackageInfo((pre) => ({ ...pre, [name]: value }));
    }
  }

  function handleProductChange(e) {
    const { checked, value } = e.target;

    if (checked) {
      setPackageInfo((pre) => ({ ...pre, products: [...pre.products, value] }));
    } else {
      setPackageInfo((pre) => ({
        ...pre,
        products: pre.products.filter((product) => product !== value),
      }));
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Box>
      <IconButton colorScheme={"blue"} onClick={onOpen} icon={<FiEdit />} />
      <Modal scrollBehavior="inside" isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Edit "{item.name}"</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Name"
              value={packageInfo.name}
              name="name"
              onChange={handleInputChange}
              mb={3}
            />
            <Textarea
              placeholder="Description"
              name="description"
              value={packageInfo.description}
              onChange={handleInputChange}
              mb={3}
            />
            <Input
              placeholder="Price"
              type={"number"}
              min={0}
              onChange={handleInputChange}
              value={packageInfo.price}
              name="price"
              mb={3}
            />
            <Flex direction={"column"}>
              <Heading mb={1} size={"sm"} fontWeight="normal" color={"GrayText"}>
                Products
              </Heading>
              {products.map((product) => {
                return (
                  <Checkbox
                    key={product._id}
                    defaultChecked={packageInfo.products.includes(product._id)}
                    onChange={handleProductChange}
                    value={product._id}
                  >
                    {product.name}
                  </Checkbox>
                );
              })}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeModal} mr={3} variant="ghost">
              Close
            </Button>
            <Button
              disabled={
                validator.isEmpty(packageInfo.name, { ignore_whitespace: true }) ||
                validator.isEmpty(packageInfo.description, { ignore_whitespace: true }) ||
                validator.isEmpty(packageInfo.price, { ignore_whitespace: true }) ||
                !packageInfo.products.length ||
                processing
              }
              onClick={updatePackage}
              colorScheme={"blue"}
            >
              {processing ? "Processing..." : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
