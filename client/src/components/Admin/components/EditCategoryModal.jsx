import { IconButton, Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { useState, useEffect } from "react";
import { BiEditAlt } from "react-icons/bi";
import { Flex, Box } from "@chakra-ui/layout";
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
import SelectList from "../../global/SelectList";

export default function EditCategoryModal({ currentCategory, categoriesOF, setCategoriesOF }) {
  const [category, setCategory] = useState(currentCategory);
  const [categories, setCategories] = useState([]);
  const [processing, setProcessing] = useState(false);
  const { onOpen, isOpen, onClose } = useDisclosure();
  const toast = useToast();

  function handleInputChange(e) {
    const { name, value } = e.target;
    setCategory((pre) => ({ ...pre, [name]: value }));
  }

  function closeModal() {
    setCategory(currentCategory);
    onClose();
  }

  // for fetching the categories
  async function fetchCategories() {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/raw_categories`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
              categoryOF.prerequisites = body.category.prerequisites.map((i) => i._id);
              categoryOF.passPercentage = body.category.passPercentage;
              categoryOF.learningPhasePaid = body.category.learningPhasePaid;
              categoryOF.checkingPhasePaid = body.category.checkingPhasePaid;
              categoryOF.quizIns = body.category.quizIns;
              categoryOF.concertIns = body.category.concertIns;
              categoryOF.cpPaymentMessage = body.category.cpPaymentMessage;
              categoryOF.courseTextSize = body.category.courseTextSize;
              categoryOF.cpPaymentMessageTextSize = body.category.cpPaymentMessageTextSize;
              categoryOF.lpPaymentMessageTextSize = body.category.lpPaymentMessageTextSize;
              categoryOF.unknownQuestionLimitForPurchase =
                body.category.unknownQuestionLimitForPurchase;
              categoryOF.cpLimit = body.category.cpLimit;
              categoryOF.displayPrice = body.category.displayPrice;
              categoryOF.exceptionalConcertFormat = body.category.exceptionalConcertFormat;
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
    // setCategory({
    //   ...currentCategory,
    //   prerequisites: currentCategory.prerequisites.map((prerequisite) => prerequisite._id),
    // });
    fetchCategories();
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
                Edit Front-page description
              </Text>
              <Textarea
                onChange={handleInputChange}
                name="frontPageText"
                placeholder="Edit front-page description"
                value={category.frontPageText}
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
                Edit Payment after checking phase text size
              </Text>
              <Select
                onChange={handleInputChange}
                name="lpPaymentMessageTextSize"
                value={category.lpPaymentMessageTextSize}
                placeholder="Edit Payment after checking phase text size"
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
            <SelectList
              listItems={categories.filter((i) => i._id !== category._id)}
              listTitle="Prerequisites"
              listDescription={
                "Prerequisites the student must have in order to continue with this product"
              }
              styles={{ marginBottom: 20 }}
              setStateAction={setCategory}
              state={category}
            />
            <Box mb={5}>
              <Checkbox
                mb={2}
                checked={!!category.checkingPhasePaid}
                defaultChecked={!!category.checkingPhasePaid}
                onChange={() =>
                  setCategory((pre) => ({ ...pre, checkingPhasePaid: !category.checkingPhasePaid }))
                }
              >
                Payment before checking phase
              </Checkbox>
              <Input
                onChange={handleInputChange}
                name="cpLimit"
                type="number"
                value={category.cpLimit}
              />
            </Box>
            <Box mb={5}>
              <Checkbox
                mb={2}
                checked={!!category.learningPhasePaid}
                defaultChecked={!!category.learningPhasePaid}
                onChange={() =>
                  setCategory((pre) => ({ ...pre, learningPhasePaid: !category.learningPhasePaid }))
                }
              >
                Payment after checking phase
              </Checkbox>
              <Input
                onChange={handleInputChange}
                name="unknownQuestionLimitForPurchase"
                type="number"
                value={category.unknownQuestionLimitForPurchase}
              />
            </Box>

            <Box>
              <Text mb={3}>
                In Concerts the <b>answer</b> is shown in pink. And the <b>question</b> is shown in
                gray. If this is an exception, the opposite will be applied in concerts
              </Text>
              <Checkbox
                checked={!!category.exceptionalConcertFormat}
                defaultChecked={!!category.exceptionalConcertFormat}
                onChange={() =>
                  setCategory((pre) => ({
                    ...pre,
                    exceptionalConcertFormat: !category.exceptionalConcertFormat,
                  }))
                }
              >
                Exceptional concert format for MCQ questions
              </Checkbox>
            </Box>
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
