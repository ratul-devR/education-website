import { Button, IconButton } from "@chakra-ui/button";
import { Flex } from "@chakra-ui/layout";
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
import { useDisclosure, Link as ChakraLink, Badge } from "@chakra-ui/react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";
import { Input } from "@chakra-ui/input";
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
    { title, description, price, passPercentage, learningPhasePaid, checkingPhasePaid },
    setInput,
  ] = useState({
    title: "",
    description: "",
    price: "",
    passPercentage: "",
    learningPhasePaid: false,
    checkingPhasePaid: false,
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
  async function fetchQuizAssets(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/get_assets`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
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
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
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
        setLoading(false);
      } else {
        toast({ status: "error", description: body.msg || "Something went wrong" });
      }
    } catch (err) {
      toast({ status: "error", description: err.message || "Error!" });
    }
  }

  // for creating a new category according to the name
  async function CreateCategory() {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/post_category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price,
          passPercentage,
          prerequisites,
          learningPhasePaid,
          checkingPhasePaid,
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
    } catch (err) {
      toast({ status: "error", description: err.message || "We are having unexpected errors" });
    }
  }

  // for deleting a category
  async function deleteCategory(id) {
    const confirmed = window.confirm("Are you sure? You want to delete this?");

    if (confirmed) {
      try {
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
      } catch (err) {
        toast({ status: "error", description: err.message || "We have an error" });
      }
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    fetchCategories(abortController);
    fetchQuizAssets(abortController);

    return () => abortController.abort();
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
          Add new Category
        </Button>

        {/* the modal which will be opened when the use click on the button */}
        <Modal onClose={onClose} isOpen={isOpen} scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create Category</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                value={title}
                onChange={HandleInputChange}
                name="title"
                placeholder="Enter the category name"
                mb={3}
              />
              <Textarea
                name="description"
                onChange={HandleInputChange}
                value={description}
                placeholder="description"
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
                  Prerequisites for this category/course
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
              <Flex mb={3}>
                <Checkbox
                  onChange={() =>
                    setInput((pre) => ({ ...pre, checkingPhasePaid: !checkingPhasePaid }))
                  }
                  checked={checkingPhasePaid}
                >
                  Checking phase is paid
                </Checkbox>
              </Flex>
              <Checkbox
                onChange={() =>
                  setInput((pre) => ({ ...pre, learningPhasePaid: !learningPhasePaid }))
                }
                checked={learningPhasePaid}
              >
                Learning phase is paid
              </Checkbox>
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
          <Table colorScheme="gray" minW="1000px">
            <Thead>
              <Th>Category name</Th>
              <Th>Price</Th>
              <Th>Total Questions</Th>
              <Th>Prerequisites</Th>
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
                    <Td>{category.price}</Td>
                    <Td>{category.questions.length}</Td>
                    <Td>
                      {category.prerequisites.length > 0 ? (
                        <Flex gridGap={3} wrap="wrap">
                          {category.prerequisites.map((prerequisite, index) => {
                            return (
                              <Badge textTransform="none" colorScheme="purple" key={index}>
                                {prerequisite.name}
                              </Badge>
                            );
                          })}
                        </Flex>
                      ) : (
                        <span>No Prerequisites</span>
                      )}
                    </Td>
                    <Td>
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
