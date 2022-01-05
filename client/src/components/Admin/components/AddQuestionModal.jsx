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
import { Text } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { Textarea } from "@chakra-ui/textarea";
import { Tag, TagLabel, TagCloseButton } from "@chakra-ui/tag";
import { useDisclosure } from "@chakra-ui/hooks";
import { useEffect } from "react";
import validator from "validator";

// internal
import useToast from "../../../hooks/useToast";
import config from "../../../config";

const AddQuestionModal = ({ modalValue, setQuestions }) => {
  const [
    {
      question,
      answer,
      type,
      timeLimit,
      concert,
      activeLearningVoice,
      passiveLearningVoice,
      passiveLearningMaleVoice,
    },
    setInput,
  ] = useState({
    question: "",
    answer: "",
    type: "",
    timeLimit: "",
    concert: "",
    activeLearningVoice: null,
    passiveLearningVoice: null,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState([]);

  const [alcs, setAlcs] = useState();

  const [answersInput, setAnswersInput] = useState("");
  const [answers, setAnswers] = useState([]);

  const [processing, setProcessing] = useState(false);

  const toast = useToast();

  // for handling input change
  function HandleInputChange(event) {
    const { name, value, files } = event.target;
    if (
      name === "activeLearningVoice" ||
      name === "passiveLearningVoice" ||
      name === "passiveLearningMaleVoice"
    ) {
      setInput((pre) => ({ ...pre, [name]: files[0] }));
    } else {
      setInput((pre) => ({ ...pre, [name]: value }));
    }
  }

  // for adding an option
  function AddOption(e) {
    e.preventDefault();
    if (!validator.isEmpty(optionInput, { ignore_whitespace: true })) {
      setOptions((pre) => [
        ...pre,
        { _id: Date.now() + Math.floor(Math.random() * 100), option: optionInput },
      ]);
      setOptionInput("");
    }
  }

  // for removing an option
  function removeOption(id) {
    setOptions((pre) => pre.filter((i) => i._id != id));
  }

  // for adding an answer
  function addAnswers(e) {
    e.preventDefault();
    if (!validator.isEmpty(answersInput, { ignore_whitespace: true })) {
      setAnswers((pre) => [
        ...pre,
        { _id: Date.now() + Math.floor(Math.random() * 100), answer: answersInput },
      ]);
      setAnswersInput("");
    }
  }

  // for removing an answer
  function removeAnswer(id) {
    setAnswers((pre) => pre.filter((i) => i._id != id));
  }

  // for adding question to the category
  async function addQuestionToCategory() {
    setProcessing(true);

    const optionsToSend = options.map((i) => i.option);
    const answersToSend = answers.map((answer) => answer.answer);

    const formData = new FormData();

    formData.append("question", question);
    formData.append("answer", answer);
    formData.append("type", type);
    formData.append("timeLimit", timeLimit);
    formData.append("concert", concert);
    optionsToSend.map((option) => {
      formData.append("options", option);
    });
    answersToSend.map((answer) => {
      formData.append("answers", answer);
    });
    formData.append("activeLearningVoice", activeLearningVoice);
    formData.append("passiveLearningVoice", passiveLearningVoice);
    formData.append("passiveLearningMaleVoice", passiveLearningMaleVoice);

    try {
      const res = await fetch(`${config.serverURL}/get_admin/add_question/${modalValue._id}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        setQuestions((pre) => [...pre, body.question]);
        toast({ status: "success", description: body.msg });
        closeModal();
        setProcessing(false);
      } else {
        toast({ status: "error", description: body.msg || "Unexpected server side error" });
        setProcessing(false);
      }
    } catch (err) {
      toast({ status: "error", description: err.message || "We are having errors" });
      setProcessing(false);
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
    <Flex>
      <Button colorScheme="secondary" color="black" onClick={onOpen}>
        Add Question
      </Button>
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
                          <Tag size="md" colorScheme="purple" key={_id}>
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
              {options && options.length > 0 && type === "mcq" && (
                <HStack mb={3} wrap="wrap" gridGap={1}>
                  {options.map(({ option, _id }) => {
                    return (
                      <Tag colorScheme="purple" key={_id}>
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
                type="number"
                onChange={HandleInputChange}
                placeholder="Time limit for this question"
                mb={3}
              />
              <Select
                disabled={!alcs}
                value={concert}
                onChange={HandleInputChange}
                name="concert"
                mb={3}
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
              <Flex
                p={5}
                flexDirection="column"
                border="1px solid"
                mb={3}
                borderColor="gray.100"
                rounded={5}
              >
                <Text color="GrayText" mb={3}>
                  Active Learning Voice / Audio
                </Text>
                <input
                  onChange={HandleInputChange}
                  name="activeLearningVoice"
                  type="file"
                  accept="audio/mpeg"
                />
              </Flex>
              <Flex
                p={5}
                flexDirection="column"
                border="1px solid"
                mb={3}
                borderColor="gray.100"
                rounded={5}
              >
                <Text color="GrayText" mb={3}>
                  Passive Learning Voice / Audio
                </Text>
                <input
                  onChange={HandleInputChange}
                  name="passiveLearningVoice"
                  type="file"
                  accept="audio/mpeg"
                />
              </Flex>
              <Flex
                p={5}
                flexDirection="column"
                border="1px solid"
                borderColor="gray.100"
                rounded={5}
              >
                <Text color="GrayText" mb={3}>
                  Passive Learning Male Voice / Audio
                </Text>
                <input
                  onChange={HandleInputChange}
                  name="passiveLearningMaleVoice"
                  type="file"
                  accept="audio/mpeg"
                />
              </Flex>
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
                !concert ||
                !activeLearningVoice ||
                !passiveLearningVoice ||
                !passiveLearningMaleVoice ||
                processing
              }
              onClick={addQuestionToCategory}
              mr={3}
            >
              {processing ? "Processing..." : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default AddQuestionModal;
