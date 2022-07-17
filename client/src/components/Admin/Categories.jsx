import { Button, IconButton } from "@chakra-ui/button";
import { Flex, Box } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/modal";
import { useDisclosure, Link as ChakraLink, Text } from "@chakra-ui/react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";
import { Input } from "@chakra-ui/input";
import { Select } from "@chakra-ui/select";
import { Checkbox } from "@chakra-ui/checkbox";
import { MdDeleteOutline } from "react-icons/md";
import { Link, useRouteMatch } from "react-router-dom";
import { Textarea } from "@chakra-ui/textarea";
import { Spinner } from "@chakra-ui/spinner";

import config from "../../config";

import useToast from "../../hooks/useToast";

import NoMessage from "../global/NoMessage";
import AddQuizAssets from "./components/AddQuizAssets";
import EditQuestionsModal from "./components/EditQuestionsModal";
import EditCategoryModal from "./components/EditCategoryModal";

const Categories = () => {
  const [
    {
      title,
      description,
      frontPageText,
      price,
      passPercentage,
      learningPhasePaid,
      quizIns,
      concertIns,
      checkingPhasePaid,
      cpPaymentMessage,
      courseTextSize,
      cpPaymentMessageTextSize,
      lpPaymentMessageTextSize,
      lpPaymentMessage,
      unknownQuestionLimitForPurchase,
      cpLimit,
      exceptionalConcertFormat,
    },
    setInput,
  ] = useState({
    title: "",
    description: "",
    frontPageText: "",
    price: "",
    passPercentage: "",
    quizIns: "",
    concertIns: "",
    learningPhasePaid: false,
    checkingPhasePaid: false,
    cpLimit: "",
    cpPaymentMessage: "",
    courseTextSize: "",
    cpPaymentMessageTextSize: "",
    lpPaymentMessageTextSize: "",
    lpPaymentMessage: "",
    unknownQuestionLimitForPurchase: "",
    exceptionalConcertFormat: false,
  });
  const [prerequisites, setPrerequisites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [quizAsset, setQuizAsset] = useState();
  const [quizAssetLoading, setQuizAssetLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();
  const { url } = useRouteMatch();

  // for handling input change in the modal
  function HandleInputChange(event) {
    const { name, value } = event.target;
    setInput((pre) => ({ ...pre, [name]: value }));
  }

  // for fetching quiz assets
  async function fetchQuizAssets() {
    const res = await fetch(`${config.serverURL}/get_admin/get_assets`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const body = await res.json();
    if (res.ok) {
      setQuizAssetLoading(false);
      setQuizAsset(body.asset);
    } else {
      toast({
        status: "error",
        description: body.msg || "We are having unexpected server side issues",
      });
    }
  }

  // for fetching the categories
  async function fetchCategories() {
    const res = await fetch(`${config.serverURL}/get_admin/raw_categories`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const body = await res.json();

    if (res.ok) {
      setCategories(body.categories);
      setLoading(false);
    } else {
      toast({ status: "error", description: body.msg || "Something went wrong" });
    }
  }

  // for creating a new category according to the name
  async function CreateCategory() {
    const res = await fetch(`${config.serverURL}/get_admin/post_category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: title,
        description,
        frontPageText,
        price,
        passPercentage,
        prerequisites,
        learningPhasePaid: learningPhasePaid || false,
        checkingPhasePaid: checkingPhasePaid || false,
        quizIns,
        concertIns,
        cpPaymentMessage,
        courseTextSize,
        cpPaymentMessageTextSize,
        lpPaymentMessageTextSize,
        lpPaymentMessage,
        unknownQuestionLimitForPurchase: unknownQuestionLimitForPurchase || 0,
        cpLimit,
        exceptionalConcertFormat,
      }),
      credentials: "include",
    });
    const body = await res.json();

    if (res.ok) {
      setCategories((pre) => [...pre, body.category]);
      setInput({});
      setPrerequisites([]);
      onClose();
      toast({ status: "success", description: body.msg });
    } else {
      toast({ status: "warning", description: body.msg });
    }
  }

  // for deleting a category
  async function deleteCategory(id) {
    const confirmed = window.confirm("Are you sure? You want to delete this?");

    if (confirmed) {
      const res = await fetch(`${config.serverURL}/get_admin/delete_category/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await res.json();

      if (res.status === 201) {
        toast({ status: "success", description: body.msg });
        setCategories((pre) => pre.filter((category) => category._id !== body.category._id));
      } else if (res.status === 400) {
        toast({ status: "warning", description: body.msg });
      } else if (res.status === 401) {
        toast({ status: "error", description: body.msg });
      }
    }
  }

  useEffect(() => {
    fetchCategories();
    fetchQuizAssets();
  }, []);

  if (loading) {
    return (
      <Flex w="full" h="full" direction="column" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  } else {
    return (
      <div>
        {/* adding quiz assets section */}
        <AddQuizAssets
          setQuizAsset={setQuizAsset}
          quizAsset={quizAsset}
          loading={quizAssetLoading}
        />

        {/* the modal button to open up the create category modal */}
        <Button mb={10} onClick={onOpen} color="black" colorScheme="secondary">
          Add new Product
        </Button>

        {/* the modal which will be opened when the user click on the button */}
        <Modal onClose={onClose} isOpen={isOpen} scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create Product</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                value={title}
                onChange={HandleInputChange}
                name="title"
                placeholder="Enter Product name"
                mb={3}
              />
              <Select
                onChange={HandleInputChange}
                name="courseTextSize"
                value={courseTextSize}
                placeholder="Product font size of product name"
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
              <Textarea
                name="description"
                onChange={HandleInputChange}
                value={description}
                placeholder="Product subtitle"
                mb={3}
              />
              <Textarea
                name="frontPageText"
                onChange={HandleInputChange}
                value={frontPageText}
                placeholder="Front-page description"
                mb={3}
              />
              <Input
                placeholder="Price"
                onChange={HandleInputChange}
                type="number"
                name="price"
                value={price}
                mb={3}
              />
              <select
                style={{
                  width: "100%",
                  outline: "none",
                  border: "2px solid #ddd",
                  borderRadius: "5px",
                  marginBottom: 12,
                }}
                value={prerequisites}
                onChange={(event) =>
                  setPrerequisites(
                    Array.from(event.target.selectedOptions, (option) => option.value)
                  )
                }
                multiple
              >
                <option
                  style={{ padding: "10px", marginBottom: "5px", fontSize: "1.2rem" }}
                  disabled
                  value=""
                >
                  Prerequisites for this product
                </option>
                {categories.map((category, index) => {
                  return (
                    <option key={index} value={category._id} style={{ padding: "5px" }}>
                      {category.name}
                    </option>
                  );
                })}
              </select>
              <Input
                type="number"
                max={100}
                min={0}
                placeholder="Pass percentage"
                onChange={HandleInputChange}
                name="passPercentage"
                value={passPercentage}
                mb={3}
              />
              <Textarea
                placeholder="Quiz instruction"
                onChange={HandleInputChange}
                name="quizIns"
                value={quizIns}
                mb={3}
              />
              <Textarea
                placeholder="Concert instruction"
                onChange={HandleInputChange}
                name="concertIns"
                value={concertIns}
                mb={3}
              />
              <Textarea
                name="cpPaymentMessage"
                onChange={HandleInputChange}
                value={cpPaymentMessage}
                placeholder="Payment before checking phase message"
                mb={3}
              />
              <Select
                onChange={HandleInputChange}
                name="cpPaymentMessageTextSize"
                value={cpPaymentMessageTextSize}
                placeholder="Payment before checking phase text size"
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
              <Textarea
                name="lpPaymentMessage"
                onChange={HandleInputChange}
                value={lpPaymentMessage}
                placeholder="Payment after checking phase message"
                mb={3}
              />
              <Select
                onChange={HandleInputChange}
                name="lpPaymentMessageTextSize"
                value={lpPaymentMessageTextSize}
                placeholder="Payment after checking phase text size"
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
              <Box mb={5}>
                <Checkbox
                  mb={2}
                  onChange={() =>
                    setInput((pre) => ({ ...pre, checkingPhasePaid: !checkingPhasePaid }))
                  }
                  checked={checkingPhasePaid}
                >
                  Payment before checking phase
                </Checkbox>
                <Input
                  placeholder="Payment before checking-phase limit"
                  type={"number"}
                  onChange={HandleInputChange}
                  name="cpLimit"
                  value={cpLimit}
                />
              </Box>

              <Box mb={3}>
                <Checkbox
                  mb={2}
                  onChange={() =>
                    setInput((pre) => ({ ...pre, learningPhasePaid: !learningPhasePaid }))
                  }
                  checked={learningPhasePaid}
                >
                  Payment after checking phase
                </Checkbox>
                <Input
                  placeholder="Payment after checking phase limit"
                  type={"number"}
                  onChange={HandleInputChange}
                  name="unknownQuestionLimitForPurchase"
                  value={unknownQuestionLimitForPurchase}
                />
              </Box>

              <Box>
                <Text mb={3}>
                  In Concerts the <b>answer</b> is shown in pink. And the <b>question</b> is shown
                  in gray. If this is an exception, the opposite will be applied in concerts
                </Text>
                <Checkbox
                  onChange={() =>
                    setInput((pre) => ({
                      ...pre,
                      exceptionalConcertFormat: !exceptionalConcertFormat,
                    }))
                  }
                >
                  Exceptional Concert format
                </Checkbox>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onClose} colorScheme="blue">
                Cancel
              </Button>
              <Button
                onClick={CreateCategory}
                colorScheme="secondary"
                color="black"
                disabled={!title || !description || !price || !passPercentage}
              >
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {categories && categories.length > 0 ? (
          <Table colorScheme="gray" minW="1300px">
            <Thead>
              <Th>Product name</Th>
              <Th>Price</Th>
              <Th>Total Questions</Th>
              <Th>Actions</Th>
            </Thead>
            <Tbody>
              {/* showing up all the categories */}
              {categories.map((category) => {
                return (
                  <Tr key={category._id}>
                    <Td>
                      <ChakraLink as={Link} to={`${url}/${category._id}/questions`}>
                        {category.name}
                      </ChakraLink>
                    </Td>
                    <Td>{category.displayPrice}</Td>
                    <Td>{category.questions.length}</Td>
                    <Td w={250}>
                      <IconButton
                        color="#fff"
                        colorScheme="red"
                        mr={3}
                        onClick={() => deleteCategory(category._id)}
                        icon={<MdDeleteOutline />}
                      />
                      <EditCategoryModal
                        categoriesOF={categories}
                        setCategoriesOF={setCategories}
                        currentCategory={category}
                      />
                      <EditQuestionsModal
                        currentCategory={{
                          ...category,
                          prerequisites: category.prerequisites.map(
                            (prerequisite) => prerequisite._id
                          ),
                        }}
                      />
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        ) : (
          // if there is no category on the DB this image and text should shown instead of the categories
          <NoMessage message="No Categories Found" />
        )}
      </div>
    );
  }
};

export default Categories;
