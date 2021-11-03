import { Button, IconButton } from "@chakra-ui/button";
import { Flex, Heading } from "@chakra-ui/layout";
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
import { useDisclosure, Link as ChakraLink } from "@chakra-ui/react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";
import { Input } from "@chakra-ui/input";
import { MdDeleteOutline } from "react-icons/md";
import { GrAdd } from "react-icons/gr";
import { Link, useHistory, useRouteMatch } from "react-router-dom";
import { Textarea } from "@chakra-ui/textarea";

import config from "../../config";

import useToast from "../../hooks/useToast";

import No from "../../assets/no.svg";

const Categories = () => {
  const [{ title, description, price }, setInput] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const history = useHistory();
  const { url } = useRouteMatch();

  // for handling input change in the modal
  function HandleInputChange(event) {
    const { name, value } = event.target;
    setInput((pre) => ({ ...pre, [name]: value }));
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
        body: JSON.stringify({ title, description, price }),
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        setCategories(body.categories);
        setInput("");
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

        if (res.ok) {
          toast({ status: "success", description: body.msg });
          setCategories(body.categories);
        } else if (res.status === 400) {
          toast({ status: "error", description: body.msg });
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

    return () => abortController.abort();
  }, []);

  if (loading) {
    return (
      <Flex w="full" h="full" direction="column" justify="center" align="center">
        <Heading fontWeight="normal" fontSize="2xl" color="gray.600">
          Loading ...
        </Heading>
      </Flex>
    );
  } else {
    return (
      <div>
        {/* the modal button to open up the create category modal */}
        <Button mb={10} onClick={onOpen} colorScheme="secondary">
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
              />
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onClose} colorScheme="blue">
                Cancel
              </Button>
              <Button
                onClick={CreateCategory}
                colorScheme="secondary"
                disabled={!title || !description || !price}
              >
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {categories && categories.length > 0 ? (
          <Table size="md" colorScheme="gray" minW="400px">
            <Thead>
              <Th>Category name</Th>
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
                    <Td>
                      <IconButton
                        color="#fff"
                        colorScheme="red"
                        mr={3}
                        onClick={() => deleteCategory(category._id)}
                        icon={<MdDeleteOutline />}
                      />
                      {/* after clicking on the button the user should be redirected to the /admin/addQuestion/:categoryId page */}
                      <IconButton
                        onClick={() =>
                          history.push(`${url}/addQuestion/${category._id}/${category.name}`)
                        }
                        colorScheme="blue"
                        icon={<GrAdd />}
                      />
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        ) : (
          // if there is no category on the DB this image and text should shown instead of the categories
          <Flex w="100%" justify="center" direction="column" align="center" py={20}>
            <img
              style={{ width: "100%", maxWidth: "300px", marginBottom: 20 }}
              src={No}
              alt="illustration"
            />
            <Heading fontSize="2xl" fontWeight="normal" color="gray.600">
              No Categories
            </Heading>
          </Flex>
        )}
      </div>
    );
  }
};

export default Categories;
