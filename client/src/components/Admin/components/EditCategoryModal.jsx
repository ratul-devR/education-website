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
import { Text } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { Checkbox } from "@chakra-ui/checkbox";
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
              categoryOF.description = body.category.description;
              categoryOF.price = body.category.price;
              categoryOF.prerequisites = body.category.prerequisites;
              categoryOF.passPercentage = body.category.passPercentage;
              categoryOF.learningPhasePaid = body.category.learningPhasePaid;
              categoryOF.checkingPhasePaid = body.category.checkingPhasePaid;
              categoryOF.quizIns = body.category.quizIns;
              categoryOF.concertIns = body.category.concertIns;
              categoryOF.cpPaymentMessage = body.category.cpPaymentMessage;
              categoryOF.courseTextSize = body.category.courseTextSize;
              categoryOF.cpPaymentMessageTextSize = body.category.cpPaymentMessageTextSize;
              categoryOF.unknownQuestionLimitForPurchase =
                body.category.unknownQuestionLimitForPurchase;
              categoryOF.displayPrice = body.category.displayPrice;
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
          <ModalHeader>Edit {category.name}</ModalHeader>
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
                Edit Product name
              </Text>
              <Input
                onChange={handleInputChange}
                name="name"
                placeholder="Edit product name"
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
                Edit product font size of product name
              </Text>
              <Select
                onChange={handleInputChange}
                name="courseTextSize"
                value={category.courseTextSize}
                placeholder="Edit product font size of product name"
                mb={3}
              >
                <option>sm</option>
                <option>md</option>
                <option>lg</option>
                <option>xl</option>
                <option>2xl</option>
                <option>3xl</option>
                <option>4xl</option>
                <option>5xl</option>
              </Select>
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
                Edit subtitle
              </Text>
              <Textarea
                onChange={handleInputChange}
                name="description"
                placeholder="Edit subtitle"
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
                Edit Display Price
              </Text>
              <Input
                onChange={handleInputChange}
                name="displayPrice"
                type="number"
                placeholder="Edit display price"
                value={category.displayPrice}
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
                placeholder="Edit Pass percentage"
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
                Quiz instruction
              </Text>
              <Textarea
                onChange={handleInputChange}
                name="quizIns"
                placeholder="Edit quiz instruction"
                value={category.quizIns}
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
                Concert instruction
              </Text>
              <Textarea
                onChange={handleInputChange}
                name="concertIns"
                placeholder="Edit concert instruction"
                value={category.concertIns}
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
                Edit Payment before checking phase message
              </Text>
              <Textarea
                onChange={handleInputChange}
                name="cpPaymentMessage"
                placeholder="Payment before checking phase message"
                value={category.cpPaymentMessage}
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
                Edit Payment before checking phase text size
              </Text>
              <Select
                onChange={handleInputChange}
                name="cpPaymentMessageTextSize"
                value={category.cpPaymentMessageTextSize}
                placeholder="Edit Payment before checking phase text size"
                mb={3}
              >
                <option>sm</option>
                <option>md</option>
                <option>lg</option>
                <option>xl</option>
                <option>2xl</option>
                <option>3xl</option>
                <option>4xl</option>
                <option>5xl</option>
              </Select>
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
                Edit Payment after checking phase message
              </Text>
              <Textarea
                onChange={handleInputChange}
                name="lpPaymentMessage"
                placeholder="Edit Payment after checking phase message"
                value={category.lpPaymentMessage}
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
                      <option key={category._id} style={{ padding: 5 }} value={category._id}>
                        {category.name}
                      </option>
                    );
                  })}
              </select>
            </Flex>
            <Flex mb={3}>
              <Checkbox
                checked={!!category.checkingPhasePaid}
                defaultChecked={!!category.checkingPhasePaid}
                onChange={() =>
                  setCategory((pre) => ({ ...pre, checkingPhasePaid: !category.checkingPhasePaid }))
                }
              >
                Payment before checking phase
              </Checkbox>
            </Flex>
            <Flex mb={3}>
              <Checkbox
                checked={!!category.learningPhasePaid}
                defaultChecked={!!category.learningPhasePaid}
                onChange={() =>
                  setCategory((pre) => ({ ...pre, learningPhasePaid: !category.learningPhasePaid }))
                }
              >
                Payment after checking phase
              </Checkbox>
            </Flex>
            <Flex p={5} rounded={5} border="1px solid" borderColor="gray.100" direction="column">
              <Text color="GrayText" mb={3}>
                After how many unknown questions the user should be asked for payment after checking
                phase?
              </Text>
              <Input
                onChange={handleInputChange}
                name="unknownQuestionLimitForPurchase"
                type="number"
                value={category.unknownQuestionLimitForPurchase}
              />
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
