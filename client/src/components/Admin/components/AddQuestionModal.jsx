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
import { useEffect } from "react";

// internal
import useToast from "../../../hooks/useToast";
import config from "../../../config";

const AddQuestionModal = ({ modalValue, isOpen, onClose, setCategories }) => {
  const [{ question, answer, type, timeLimit, concert }, setInput] = useState({
    question: "",
    answer: "",
    type: "",
    timeLimit: "",
    concert: "",
  });

  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState([]);

  const [alcs, setAlcs] = useState();

  const [answersInput, setAnswersInput] = useState("");
  const [answers, setAnswers] = useState([]);

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

  // for adding an answer
  function addAnswers(e) {
    e.preventDefault();
    setAnswers((pre) => [
      ...pre,
      { _id: Date.now() + Math.floor(Math.random() * 100), answer: answersInput },
    ]);
    setAnswersInput("");
  }

  // for removing an answer
  function removeAnswer(id) {
    setAnswers((pre) => pre.filter((i) => i._id != id));
  }

  // for adding question to the category
  async function addQuestionToCategory() {
    const optionsToSend = options.map((i) => i.option);
    const answersToSend = answers.map((answer) => answer.answer);
    try {
      const res = await fetch(`${config.serverURL}/get_admin/add_question/${modalValue._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answer,
          options: optionsToSend,
          type,
          concert,
          timeLimit,
          answers: answersToSend,
        }),
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

  // for fetching alcs
  async function fetchAlcs(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/active_learning_concert`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        credentials: "include",
      });
      const body = await res.json();
      if (res.ok) {
        setAlcs(body.items.length > 0 ? body.items : null);
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  // for closing up the modal and resetting the values
  function closeModal() {
    setInput({ answer: "", question: "" });
    setOptionInput("");
    setOptions([]);
    onClose();
  }

  useEffect(() => {
    const abortController = new AbortController();
    fetchAlcs(abortController);
    return () => abortController.abort();
  }, []);

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
              <form onSubmit={addAnswers}>
                <Input
                  onChange={(event) => setAnswersInput(event.target.value)}
                  placeholder="Enter the possible answers"
                  value={answersInput}
                  mb={3}
                />
                {answers && answers.length > 0 && (
                  <HStack mb={3} wrap="wrap" gridGap={1}>
                    {answers.map(({ answer, _id }) => {
                      return (
                        <Tag variant="solid" size="md" key={_id}>
                          <TagLabel>{answer}</TagLabel>
                          <TagCloseButton onClick={() => removeAnswer(_id)} />
                        </Tag>
                      );
                    })}
                  </HStack>
                )}
              </form>
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
                {options.map(({ option, _id }) => {
                  return (
                    <Tag variant="solid" size="md" key={_id}>
                      <TagLabel>{option}</TagLabel>
                      <TagCloseButton onClick={() => removeOption(_id)} />
                    </Tag>
                  );
                })}
              </HStack>
            )}
            {options && options.length > 0 && type === "mcq" && (
              <Select
                placeholder="Correct answer"
                name="answer"
                onChange={HandleInputChange}
                value={answer}
                mb={3}
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
              mb={3}
            />
            <Select
              disabled={!alcs}
              value={concert}
              onChange={HandleInputChange}
              name="concert"
              placeholder={alcs ? "Where it will be taught? (concert)" : "No Concerts found"}
            >
              {alcs &&
                alcs.length > 0 &&
                alcs.map((alc) => {
                  return (
                    <option key={alc._id} value={alc._id}>
                      {alc.title}
                    </option>
                  );
                })}
            </Select>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button onClick={closeModal} colorScheme="blue" mr={3}>
            Cancel
          </Button>
          <Button
            colorScheme="secondary"
            color="black"
            disabled={
              (type === "text" && !answers.length) ||
              (type === "mcq" && !answer) ||
              !question ||
              !type ||
              !timeLimit ||
              !concert
            }
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
