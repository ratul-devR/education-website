const mongoose = require("mongoose");
const csvJson = require("csvtojson/v2");
const { Parser } = require("json2csv");
const request = require("request");
const { unlink, writeFile } = require("fs");
const path = require("path");

const Category = require("../models/category");
const Question = require("../models/question");
const User = require("../models/people");
const Org = require("../models/org");
const QuizAsset = require("../models/quizAsset");
const File = require("../models/files");
const ConvertedFile = require("../models/convertedFile");

const transporter = require("../utils/emailTransporter");

module.exports = {
  getCategories: async function (_req, res, next) {
    try {
      const categories =
        (await Category.find({}).lean({ defaults: true }).populate("questions prerequisites")) ||
        [];

      res.status(201).json({ categories });
    } catch (err) {
      next(err);
    }
  },

  getUsers: async function (_req, res, next) {
    try {
      const users = await User.find({}).lean({ defaults: true }).populate("referer");
      res.status(200).json({ users });
    } catch (err) {
      next(err);
    }
  },

  getOrganizations: async function (_req, res, next) {
    try {
      let organizations = await Org.find({}).populate("refers").lean({ defaults: true });

      res.status(200).json({ organizations });
    } catch (err) {
      next(err);
    }
  },

  sendMails: async function (req, res, next) {
    try {
      const { subject, email } = req.body;
      const orgs = await Org.find({ subscribed: true }).lean({ defaults: true });

      // list all the emails of subscribed organizations
      let listOfMails = orgs.map((org) => org.email);

      if (listOfMails.length === 0) {
        res.status(400).json({ msg: "There are no subscribed organizations" });
      }

      // send the mail
      await transporter.sendMail({
        from: `${process.env.EMAIL}`,
        to: listOfMails,
        subject,
        text: email,
      });

      res
        .status(200)
        .json({ msg: `The message was successfully sent to ${listOfMails.length} organizations` });
    } catch (err) {
      next(err);
    }
  },

  postCategory: async function (req, res, next) {
    try {
      const {
        title,
        description,
        price,
        passPercentage,
        prerequisites,
        learningPhasePaid,
        checkingPhasePaid,
        quizIns,
        concertIns,
      } = req.body;

      const categoryExist =
        (await Category.findOne({ name: title }).lean({ defaults: true })) || null;

      if (categoryExist) {
        res.status(400).json({ msg: "This category already exists" });
      } else {
        const newCategory = new Category({
          name: title,
          description,
          price,
          prerequisites,
          passPercentage,
          learningPhasePaid,
          checkingPhasePaid,
          quizIns,
          concertIns,
        });

        await newCategory.save();
        await newCategory.populate("prerequisites");

        res
          .status(201)
          .json({ msg: `"${newCategory.name}" has been created`, category: newCategory });
      }
    } catch (err) {
      next(err);
    }
  },

  updateCategory: async function (req, res, next) {
    try {
      const { categoryId } = req.params;
      const updatedInfo = req.body;

      const updatedCategory = await Category.findOneAndUpdate({ _id: categoryId }, updatedInfo, {
        new: true,
      }).populate("prerequisites");

      res.status(201).json({ msg: "Updated Successfully", category: updatedCategory });
    } catch (err) {
      next(err);
    }
  },

  deleteCategory: async function (req, res, next) {
    try {
      const { id } = req.params;

      const doc = await Category.findOne({ _id: id });

      await Category.deleteOne({ _id: doc._id });
      await Question.deleteMany({ category: id });

      res.status(201).json({ msg: `"${doc.name}" has been deleted`, category: doc });
    } catch (err) {
      next(err);
    }
  },

  uploadQuizAssets: async function (req, res, next) {
    try {
      const { positive_sound, negative_sound } = req.files;
      const domain = req.protocol + "://" + req.get("host") + "/";

      const asset = new QuizAsset({
        positive_sound: {
          name: positive_sound[0].filename,
          url: domain + "uploads/quiz-assets/" + positive_sound[0].filename,
        },
        negative_sound: {
          name: negative_sound[0].filename,
          url: domain + "uploads/quiz-assets/" + negative_sound[0].filename,
        },
      });

      await asset.save();

      res.status(200).json({ msg: "Uploaded And Saved Successfully", asset });
    } catch (err) {
      next(err);
    }
  },

  uploadFiles: async function (req, res, next) {
    try {
      const files = req.files;
      const { category } = req.body;

      const fileData = files.map((file) => ({
        name: file.filename,
        url: req.protocol + "://" + req.get("host") + "/" + "uploads/" + "files/" + file.filename,
        category,
      }));

      const uploadedFiles = await File.insertMany(fileData);

      res.status(201).json({ msg: "Files were uploaded successfully", files: uploadedFiles });
    } catch (err) {
      next(err);
    }
  },

  getFiles: async function (_, res, next) {
    try {
      const files = await File.find({}).lean({ defaults: true }).sort({ createdAt: -1 });
      res.status(200).json({ files });
    } catch (err) {
      next(err);
    }
  },

  getFilesOfCategory: async function (req, res, next) {
    try {
      const { categoryId } = req.params;
      const files = await File.find({ category: categoryId })
        .lean({ defaults: true })
        .sort({ createdAt: -1 });
      res.status(200).json({ files });
    } catch (err) {
      next(err);
    }
  },

  searchFiles: async function (req, res, next) {
    try {
      const { searchQuery } = req.params;

      const files = await File.find({
        $or: [{ name: { $regex: `${searchQuery}`, $options: "gi" } }],
      }).lean({ defaults: true });

      res.status(200).json({ files });
    } catch (err) {
      next(err);
    }
  },

  deleteFile: async function (req, res, next) {
    try {
      const { fileId } = req.params;

      const deletedFile = await File.findByIdAndRemove(fileId);

      unlink(__dirname + "/../public/uploads/files/" + deletedFile.name, (err) => {
        if (err) console.log(err);
      });

      res.status(201).json({ msg: "The file was deleted", file: deletedFile });
    } catch (err) {
      next(err);
    }
  },

  getQuizAssets: async function (_req, res, next) {
    try {
      const asset = (await QuizAsset.find({}))[0] || null;
      res.status(200).json({ asset });
    } catch (err) {
      next(err);
    }
  },

  deleteQuizAssets: async function (_req, res, next) {
    try {
      const asset = (await QuizAsset.find({}))[0];
      unlink(
        path.join(__dirname, `../public/uploads/quiz-assets/${asset.positive_sound.name}`),
        (err) => (err ? err : null)
      );
      unlink(
        path.join(__dirname, `../public/uploads/quiz-assets/${asset.negative_sound.name}`),
        (err) => (err ? err : null)
      );
      await QuizAsset.deleteOne({ _id: asset._id });
      res.status(201).json({ msg: "Deleted" });
    } catch (err) {
      next(err);
    }
  },

  addQuestion: async function (req, res, next) {
    try {
      const { categoryId } = req.params;
      const { question, options, answer, type, timeLimit, answers } = req.body;
      const { activeLearningVoice, passiveLearningVoice, passiveLearningMaleVoice } = req.files;

      let newQuestion;

      if (type === "mcq") {
        newQuestion = new Question({
          question,
          options,
          answers: [answer],
          category: categoryId,
          type,
          timeLimit,
        });
      } else {
        newQuestion = new Question({
          question,
          answers,
          category: categoryId,
          type,
          timeLimit,
        });
      }

      const url = req.protocol + "://" + req.get("host") + "/uploads/question-audios/";

      newQuestion.activeLearningVoice = url + activeLearningVoice[0].filename;
      newQuestion.passiveLearningVoice = url + passiveLearningVoice[0].filename;
      newQuestion.passiveLearningMaleVoice = url + passiveLearningMaleVoice[0].filename;

      await newQuestion.save();

      await Category.updateOne({ _id: categoryId }, { $push: { questions: newQuestion } });

      res
        .status(201)
        .json({ msg: "Question has been added to the category", question: newQuestion });
    } catch (err) {
      next(err);
    }
  },

  updateQuestion: async function (req, res, next) {
    try {
      const { questionId } = req.params;
      const { question, options, answers, timeLimit } = req.body;

      const updatedQuestion = await Question.findOneAndUpdate(
        { _id: questionId },
        { question, options, answers, timeLimit },
        { new: true }
      );

      res.status(201).json({ msg: "Question Updated Successfully", question: updatedQuestion });
    } catch (err) {
      next(err);
    }
  },

  updateQuestions: async function (req, res, next) {
    try {
      const { categoryId } = req.params;
      const body = req.body;

      await Question.updateMany({ category: categoryId }, { ...body });

      res.status(201).json({ msg: "Updated Successfully" });
    } catch (err) {
      next(err);
    }
  },

  addQuestionsFromCsv: async function (req, res, next) {
    try {
      const file = req.file;
      const { category } = req.body;
      const filePath =
        req.protocol + "://" + req.get("host") + `/uploads/question-csv-files/${file.filename}`;
      // all the json data parsed from the csv file is here (parsed)
      const jsonData = await csvJson().fromStream(request.get(filePath));

      // time to parse them so we can insert them in the DB
      for (let i = 0; i < jsonData.length; i++) {
        const question = jsonData[i];

        if (!question.type) {
          res.status(400).json({ msg: "Please add a type" });
        }

        if (question.type === "mcq") {
          if (
            !question.question ||
            !question.option1_answer ||
            !question.option2 ||
            !question.option3 ||
            !question.option4 ||
            !question.option5 ||
            !question.timeLimit ||
            !question.activeLearningVoice ||
            !question.passiveLearningVoice ||
            !question.passiveLearningMaleVoice
          ) {
            unlink(
              path.join(__dirname, `/../public/uploads/question-csv-files/${file.filename}`),
              (err) => (err ? err : null)
            );
            res.status(400).json({
              msg: `A required field is missing in the doc. On row/line number: [${i + 1}]`,
            });
          }

          question.options = [];

          question.options.push(
            question.option1_answer,
            question.option2,
            question.option3,
            question.option4,
            question.option5
          );
          question.answers = [question.option1_answer];
          question.category = category;

          // delete the raw dummy fields
          delete question.option1_answer;
          delete question.option2;
          delete question.option3;
          delete question.option4;
          delete question.option5;
        } else if (question.type === "text") {
          if (
            !question.question ||
            !question.answers ||
            !question.timeLimit ||
            !question.activeLearningVoice ||
            !question.passiveLearningVoice ||
            !question.passiveLearningMaleVoice
          ) {
            unlink(
              path.join(__dirname, `/../public/uploads/question-csv-files/${file.filename}`),
              (err) => (err ? err : null)
            );
            res.status(400).json({
              msg: `A required field is missing in the doc. On row/line number: [${i + 1}]`,
            });
          }

          question.answers = question.answers.split(", ");
          question.category = category;
        }
      }

      // now time to save them!
      const uploadedDocs = await Question.insertMany(jsonData); // now update the fields of the category

      await Category.updateOne({ _id: category }, { $push: { questions: uploadedDocs } }).lean({
        defaults: true,
      });

      // once everything is done, delete the file. Cause we don't need that
      unlink(
        path.join(__dirname, `/../public/uploads/question-csv-files/${file.filename}`),
        (err) => (err ? err : null)
      );

      res.status(200).json({
        msg: "The set of questions were uploaded from your csv file!",
        questions: uploadedDocs,
      });
    } catch (err) {
      next(err);
    }
  },

  convertFile: async function (req, res, next) {
    try {
      const file = req.file;
      const { type, timeLimit } = req.body;
      const filePath = `${req.protocol}://${req.get("host")}/uploads/convertedFiles/${
        file.filename
      }`;
      const jsonData = await csvJson().fromStream(request.get(filePath));

      function deleteFile() {
        unlink(path.join(__dirname, `/../public/uploads/convertedFiles/${file.filename}`), (err) =>
          err ? err : null
        );
      }

      // validate the information
      for (let i = 0; i < jsonData.length; i++) {
        const question = jsonData[i];
        if (
          type === "mcq" &&
          (!question.question ||
            !question.option1_answer ||
            !question.option2 ||
            !question.option3 ||
            !question.option4 ||
            !question.option5 ||
            !question.activeLearningVoice ||
            !question.passiveLearningVoice ||
            !question.passiveLearningMaleVoice)
        ) {
          deleteFile();
          res.status(400).json({
            msg: "MCQ questions must contain these fields: question, option1_answer, option2, option3, option4, option5, activeLearningVoice, passiveLearningVoice, passiveLearningMaleVoice",
          });
        } else if (
          type === "text" &&
          (!question.question ||
            !question.answers ||
            !question.activeLearningVoice ||
            !question.passiveLearningMaleVoice ||
            !question.passiveLearningVoice)
        ) {
          deleteFile();
          res.status(400).json({
            msg: "Text questions must contain these fields: question, answers, activeLearningVoice, passiveLearningVoice, passiveLearningMaleVoice",
          });
        }
        // if everything is ok, then convert it into valid format
        else {
          jsonData[i] = {
            ...jsonData[i],
            type,
            timeLimit,
          };
        }
      }

      // once we are done, then delete the file
      deleteFile();

      const parser = new Parser();
      const parsedCSV = parser.parse(jsonData);

      // finally convert it into a CSV file
      writeFile(
        path.join(__dirname, `/../public/uploads/convertedFiles/${file.filename}`),
        parsedCSV,
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );

      // now create a new mongo doc with this file info
      const newConvertedFile = new ConvertedFile({ name: file.filename, url: filePath });
      await newConvertedFile.save();

      res.status(201).json({ msg: "File converted successfully", file: newConvertedFile });
    } catch (err) {
      next(err);
    }
  },

  deleteFileConvertedFile: async function (req, res, next) {
    try {
      const { fileId } = req.params;

      const deletedDoc = await ConvertedFile.findOneAndDelete({ _id: fileId });

      function deleteFile(fileName) {
        unlink(path.join(__dirname, `/../public/uploads/convertedFiles/${fileName}`), (err) =>
          err ? err : null
        );
      }

      deleteFile(deletedDoc.name);

      res.status(201).json({ msg: "The file has been deleted", file: deletedDoc });
    } catch (err) {
      next(err);
    }
  },

  getConvertedFiles: async function (_, res, next) {
    try {
      const convertedFiles = await ConvertedFile.find({})
        .lean({ defaults: true })
        .sort({ createdAt: -1 });
      res.status(201).json({ files: convertedFiles });
    } catch (err) {
      next(err);
    }
  },

  getQuestions: async function (req, res, next) {
    try {
      const { categoryId } = req.params;

      if (mongoose.isValidObjectId(categoryId)) {
        const category = await Category.findOne({ _id: categoryId })
          .lean({ defaults: true })
          .populate("questions");

        if (category) {
          res.status(200).json({ questions: category.questions, category });
        } else {
          res.status(404).json({ msg: "No category found" });
        }
      } else {
        res.status(404).json({ msg: "Invalid Category" });
      }
    } catch (err) {
      next(err);
    }
  },

  deleteQuestion: async function (req, res, next) {
    try {
      const { questionId, categoryId } = req.params;

      const deletedQuestion = await Question.findByIdAndDelete({ _id: questionId });

      deletedQuestion.activeLearningVoice =
        deletedQuestion.activeLearningVoice.split("question-audios/")[1];
      deletedQuestion.passiveLearningVoice =
        deletedQuestion.passiveLearningVoice.split("question-audios/")[1];
      deletedQuestion.passiveLearningMaleVoice =
        deletedQuestion.passiveLearningMaleVoice.split("question-audios/")[1];

      if (
        deletedQuestion.activeLearningVoice &&
        deletedQuestion.passiveLearningVoice &&
        deletedQuestion.passiveLearningMaleVoice
      ) {
        unlink(
          __dirname + `/../public/uploads/question-audios/${deletedQuestion.activeLearningVoice}`,
          (err) => {
            if (err) console.log(err);
          }
        );
        unlink(
          __dirname + `/../public/uploads/question-audios/${deletedQuestion.passiveLearningVoice}`,
          (err) => {
            if (err) console.log(err);
          }
        );
        unlink(
          __dirname +
            `/../public/uploads/question-audios/${deletedQuestion.passiveLearningMaleVoice}`,
          (err) => {
            if (err) console.log(err);
          }
        );
      }

      await Category.findOneAndUpdate({ _id: categoryId }, { $pull: { questions: questionId } });

      res.status(201).json({
        msg: `"${deletedQuestion.question}" has been removed`,
        question: deletedQuestion,
      });
    } catch (err) {
      next(err);
    }
  },
};
