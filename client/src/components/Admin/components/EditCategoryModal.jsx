import { IconButton, Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { useState, useEffect } from "react";
import { BiEditAlt } from "react-icons/bi";
import { Flex } from "@chakra-ui/layout";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/modal";
import { Input } from "@chakra-ui/input";
import { Textarea } from "@chakra-ui/textarea";
import { Select } from "@chakra-ui/select";
import { Text } from "@chakra-ui/react";
import config from "../../../config";
import useToast from "../../../hooks/useToast";

export default function EditCategoryModal({ currentCategory, categoriesOF, setCategoriesOF }) {
  const [category, setCategory] = useState(currentCategory);
  const [categories, setCategories] = useState([]);
  const [processing, setProcessing] = useState(false);
  const { onOpen, isOpen, onClose } = useDisclosure();
  const toast = useToast();

  function handleInputChange(e) {
    const { name, value, selectedOptions } = e.target;
    if (name !== "prerequisites") {
      setCategory((pre) => ({ ...pre, [name]: value }));
    } else {
      setCategory((pre) => ({
        ...pre,
        [name]: Array.from(selectedOptions).map((option) => option.value),
      }));
    }
  }

  function closeModal() {
    setCategory(currentCategory);
    onClose();
  }

  // for fetching the categories
  async function fetchCategories(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/categories`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
      });
      const body = await res.json();

      if (res.ok) {
        setCategories(body.categories);
      } else {
        toast({ status: "error", description: body.msg || "Something went wrong" });
      }
    } catch (err) {
      toast({ status: "error", description: err.message || "Error!" });
    }
  }

  async function saveChanges() {
    setProcessing(true);
    try {
      const res = await fetch(`${config.serverURL}/get_admin/update_category/${category._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(category),
      });
      const body = await res.json();
      if (res.ok) {
        closeModal();
        setCategoriesOF(
          categoriesOF.map((categoryOF) => {
            if (categoryOF._id === body.category._id) {
              categoryOF.name = body.category.name;
              categoryOF.price = body.category.price;
              categoryOF.prerequisites = body.category.prerequisites;
              categoryOF.askForPaymentIn = body.category.askForPaymentIn;
              categoryOF.passPercentage = body.category.passPercentage;
            }
            return categoryOF;
          })
        );
        setProcessing(false);
      } else {
        toast({ status: "error", description: body.msg });
        setProcessing(false);
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
      setProcessing(false);
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    setCategory({
      ...currentCategory,
      prerequisites: currentCategory.prerequisites.map((prerequisite) => prerequisite._id),
    });
    fetchCategories(abortController);
    return () => abortController.abort();
  }, []);

  return (
    <Flex direction="column" display="inline-block" mr={3}>
      <IconButton colorScheme="secondary" color="black" icon={<BiEditAlt />} onClick={onOpen} />
      <Modal scrollBehavior="inside" isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Edit Category</ModalHeader>
          <ModalBody>
            <Flex
              p={5}
              rounded={5}
              mb={5}
              border="1px solid"
              borderColor="gray.100"
              direction="column"
            >
              <Text color="GrayText" mb={3}>
                Edit category name
              </Text>
              <Input
                onChange={handleInputChange}
                name="name"
                placeholder="Edit category name"
                value={category.name}
              />
            </Flex>
            <Flex
              p={5}
              rounded={5}
              mb={5}
              border="1px solid"
              borderColor="gray.100"
              direction="column"
            >
              <Text color="GrayText" mb={3}>
                Edit description
              </Text>
              <Textarea
                onChange={handleInputChange}
                name="description"
                placeholder="Edit description"
                value={category.description}
              />
            </Flex>
            <Flex
              p={5}
              rounded={5}
              mb={5}
              border="1px solid"
              borderColor="gray.100"
              direction="column"
            >
              <Text color="GrayText" mb={3}>
                Edit Price
              </Text>
              <Input
                onChange={handleInputChange}
                name="price"
                type="number"
                placeholder="Edit price"
                value={category.price}
              />
            </Flex>
            <Flex
              p={5}
              rounded={5}
              mb={5}
              border="1px solid"
              borderColor="gray.100"
              direction="column"
            >
              <Text color="GrayText" mb={3}>
                Edit Pass Percentage
              </Text>
              <Input
                onChange={handleInputChange}
                name="passPercentage"
                type="number"
                min={0}
                max={100}
                placeholder="Edit price"
                value={category.passPercentage}
              />
            </Flex>
            <Flex
              p={5}
              rounded={5}
              mb={5}
              border="1px solid"
              borderColor="gray.100"
              direction="column"
            >
              <Text color="GrayText" mb={3}>
                Edit Payment asking phase
              </Text>
              <Select
                placeholder="Where should we ask for payment"
                value={category.askForPaymentIn}
                onChange={handleInputChange}
                name="askForPaymentIn"
              >
                <option value="checking-phase">Checking phase</option>
                <option value="learning-phase">Learning phase</option>
              </Select>
            </Flex>
            <Flex p={5} rounded={5} border="1px solid" borderColor="gray.100" direction="column">
              <Text color="GrayText" mb={3}>
                Edit Prerequisites
              </Text>
              <select
                value={category.prerequisites}
                style={{ outline: "none" }}
                multiple
                onChange={handleInputChange}
                name="prerequisites"
              >
                {categories &&
                  categories.map((category) => {
                    return (
                      <option style={{ padding: 5 }} value={category._id}>
                        {category.name}
                      </option>
                    );
                  })}
              </select>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeModal} mr={3}>
              cancel
            </Button>
            <Button
              disabled={
                !category.passPercentage ||
                !category.name ||
                !category.description ||
                !category.price ||
                !category.askForPaymentIn ||
                processing
              }
              onClick={saveChanges}
              colorScheme="secondary"
              color="black"
            >
              {processing ? "Processing..." : "Save changes"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
