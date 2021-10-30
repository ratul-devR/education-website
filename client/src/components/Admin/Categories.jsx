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
import { useDisclosure } from "@chakra-ui/react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";
import { Input } from "@chakra-ui/input";
import { MdDeleteOutline } from "react-icons/md";
import { GrAdd } from "react-icons/gr";
import { useHistory, useRouteMatch } from "react-router-dom";

import config from "../../config";

import useToast from "../../hooks/useToast";

import No from "../../assets/no.svg";

const Categories = () => {
  const [input, setInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const history = useHistory();
  const { url } = useRouteMatch();

  console.log(categories);

  // for fetching the categories
  async function fetchCategories() {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/categories`, {
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
        body: JSON.stringify({ categoryName: input }),
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        setCategories(body.categories);
        setInput("");
        onClose();
        toast({ status: "success", description: body.msg });
      } else if (res.status === 400) {
        toast({ status: "error", description: body.msg });
      } else if (res.status === 401) {
        toast({ status: "error", description: body.msg });
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

  return (
    <Flex
      w="full"
      h="full"
      flexDirection="column"
      overflow="hidden"
      justify="center"
      align="center"
    >
      {/* if the data is loading show up this loader instead of the content */}
      {loading ? (
        <Flex>
          <Heading fontWeight="normal" fontSize="2xl" color="gray.600">
            Loading ...
          </Heading>
        </Flex>
      ) : (
        <Flex
          p={10}
          w="95%"
          overflowX="hidden"
          flexDirection="column"
          h="95%"
          bg="white"
          boxShadow="md"
          rounded={5}
        >
          <div>
            {/* the modal button to open up the create category modal */}
            <Button mb={10} onClick={onOpen} colorScheme="blue">
              Add new Category
            </Button>
          </div>

          {/* the modal which will be opened when the use click on the button */}
          <Modal onClose={onClose} isOpen={isOpen} scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Create Category</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Input
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value);
                  }}
                  placeholder="Enter the category name"
                />
              </ModalBody>
              <ModalFooter>
                <Button mr={3} onClick={onClose} colorScheme="blue">
                  Cancel
                </Button>
                <Button onClick={CreateCategory} colorScheme="teal" disabled={!input}>
                  Save
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {categories && categories.length > 0 ? (
            <Table size="md" colorScheme="gray">
              <Thead>
                <Th>Category name</Th>
                <Th>Actions</Th>
              </Thead>
              <Tbody>
                {/* showing up all the categories */}
                {categories.map((category) => {
                  return (
                    <Tr key={category._id}>
                      <Td>{category.name}</Td>
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
                          color="#fff"
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
        </Flex>
      )}
    </Flex>
  );
};

export default Categories;
