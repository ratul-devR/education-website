// external
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/modal";
import { Flex, HStack } from "@chakra-ui/layout";
import { Input } from "@chakra-ui/input";
import { useState } from "react";
import { Button } from "@chakra-ui/button";
import { Select } from "@chakra-ui/select";
import { Textarea } from "@chakra-ui/textarea";
import { Tag, TagLabel, TagCloseButton } from "@chakra-ui/tag";

// internal
import useToast from "../../../hooks/useToast";
import config from "../../../config";

const AddQuestionModal = ({ modalValue, isOpen, onClose, setCategories }) => {
  const [{ question, answer, type, timeLimit }, setInput] = useState({
    question: "",
    answer: "",
    type: "",
    timeLimit: "",
  });
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState([]);
  const toast = useToast();

  // for handling input change
  function HandleInputChange(event) {
    const { name, value } = event.target;
    setInput((pre) => ({ ...pre, [name]: value }));
  }

  // for adding an option
  function AddOption(e) {
    e.preventDefault();
    if (optionInput !== "") {
      setOptionInput("");
      setOptions((pre) => [
        ...pre,
        { _id: Date.now() + Math.floor(Math.random() * 100), option: optionInput },
      ]);
    }
  }

  // for removing an option
  function removeOption(id) {
    setOptions((pre) => pre.filter((i) => i._id != id));
  }

  // for adding question to the category
  async function addQuestionToCategory() {
    const optionsToSend = options.map((i) => i.option);
    try {
      const res = await fetch(`${config.serverURL}/get_admin/add_question/${modalValue._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, options: optionsToSend, type, timeLimit }),
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        toast({ status: "success", description: body.msg });
        setCategories((pre) =>
          pre.map((category) => {
            if (category._id == modalValue._id) {
              category.questions.push(body.question);
            }
            return category;
          })
        );
        closeModal();
      }
    } catch (err) {
      toast({ status: "error", description: err.message || "We are having errors" });
    }
  }

  // for closing up the modal and resetting the values
  function closeModal() {
    setInput({ answer: "", question: "" });
    setOptionInput("");
    setOptions([]);
    onClose();
  }

  return (
    <Modal onClose={closeModal} isOpen={isOpen} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Question to: "{modalValue.name}"</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" w="100%" maxW="400px" margin="auto">
            <Textarea
              mb={3}
              placeholder="Enter the question"
              name="question"
              value={question}
              onChange={HandleInputChange}
            />
            <Select
              placeholder="Type of this question"
              name="type"
              value={type}
              onChange={HandleInputChange}
              mb={3}
            >
              <option value="mcq">MCQ</option>
              <option value="text">Text</option>
            </Select>
            {type === "text" && (
              <Input
                name="answer"
                onChange={HandleInputChange}
                placeholder="Enter the answer"
                value={answer}
              />
            )}
            {/* only if the type is mcq, then let the user to add options */}
            {type === "mcq" && (
              <form onSubmit={AddOption}>
                <Input
                  onChange={(event) => setOptionInput(event.target.value)}
                  value={optionInput}
                  mb={3}
                  colorScheme="red"
                  placeholder="Enter the options > hit enter"
                />
              </form>
            )}
            {options && options.length > 0 && (
              <HStack mb={3} wrap="wrap" gridGap={1}>
                {options.length > 0 &&
                  options.map(({ _id, option }) => {
                    return (
                      <Tag variant="solid" size="md" key={_id}>
                        <TagLabel>{option}</TagLabel>
                        <TagCloseButton onClick={() => removeOption(_id)} />
                      </Tag>
                    );
                  })}
              </HStack>
            )}
            {options && options.length > 0 && (
              <Select
                placeholder="Correct answer"
                name="answer"
                onChange={HandleInputChange}
                value={answer}
              >
                {options &&
                  options.length &&
                  options.map(({ _id, option }) => {
                    return (
                      <option key={_id} value={option}>
                        {option}
                      </option>
                    );
                  })}
              </Select>
            )}
            <Input
              name="timeLimit"
              value={timeLimit}
              onChange={HandleInputChange}
              placeholder="Time limit for this question"
            />
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button onClick={closeModal} colorScheme="blue" mr={3}>
            Cancel
          </Button>
          <Button
            colorScheme="secondary"
            color="black"
            disabled={!answer || !question || !type}
            onClick={addQuestionToCategory}
            mr={3}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddQuestionModal;
