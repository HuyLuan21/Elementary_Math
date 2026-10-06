import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit3,
  FileQuestion,
  HelpCircle,
  ListOrdered,
  Plus,
  Trash2,
  X,
} from 'lucide-react-native';
import { AdminChapter, AdminLesson, AdminQuestion } from '../../types/admin';
import { AdminTooltipButton } from './AdminTooltipButton';

interface AdminCurriculumTabProps {
  chapters: AdminChapter[];
  onSaveChapter: (chapter: Partial<AdminChapter>) => Promise<void>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
  onSaveLesson: (chapterId: string, lesson: Partial<AdminLesson>) => Promise<void>;
  onDeleteLesson: (chapterId: string, lessonId: string) => Promise<void>;
  onSaveQuestion?: (lessonId: string, question: Partial<AdminQuestion>) => Promise<void>;
  onDeleteQuestion?: (lessonId: string, questionId: string) => Promise<void>;
}

export const AdminCurriculumTab: React.FC<AdminCurriculumTabProps> = ({
  chapters,
  onSaveChapter,
  onDeleteChapter,
  onSaveLesson,
  onDeleteLesson,
  onSaveQuestion,
  onDeleteQuestion,
}) => {
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(
    chapters[0]?.id || null
  );

  // Chapter Modal
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [editingChapter, setEditingChapter] = useState<AdminChapter | null>(null);
  const [chapterForm, setChapterForm] = useState({
    title: '',
    description: '',
  });

  // Lesson Modal
  const [lessonModalVisible, setLessonModalVisible] = useState(false);
  const [targetChapterId, setTargetChapterId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    icon: '📝',
    rewardStars: '3',
    questionCount: '5',
    status: 'published' as 'published' | 'draft',
  });

  // Question Management Modal
  const [questionsModalVisible, setQuestionsModalVisible] = useState(false);
  const [activeLesson, setActiveLesson] = useState<AdminLesson | null>(null);

  // Question Edit/Create Modal
  const [questionFormModalVisible, setQuestionFormModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
  });

  // Keep activeLesson in sync with chapters state
  React.useEffect(() => {
    if (activeLesson) {
      for (const ch of chapters) {
        const found = ch.lessons.find((l) => l.id === activeLesson.id);
        if (found) {
          setActiveLesson(found);
          break;
        }
      }
    }
  }, [chapters]);

  // Chapter Handlers
  const openAddChapterModal = () => {
    setEditingChapter(null);
    setChapterForm({
      title: `Chương ${chapters.length + 1}: `,
      description: '',
    });
    setChapterModalVisible(true);
  };

  const openEditChapterModal = (ch: AdminChapter) => {
    setEditingChapter(ch);
    setChapterForm({
      title: ch.title,
      description: ch.description,
    });
    setChapterModalVisible(true);
  };

  const handleSaveChapter = async () => {
    if (!chapterForm.title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chương');
      return;
    }
    await onSaveChapter({
      ...(editingChapter ? { id: editingChapter.id } : {}),
      title: chapterForm.title,
      description: chapterForm.description,
    });
    setChapterModalVisible(false);
  };

  // Lesson Handlers
  const openAddLessonModal = (chapterId: string) => {
    setTargetChapterId(chapterId);
    setEditingLesson(null);
    setLessonForm({
      title: '',
      description: '',
      icon: '📐',
      rewardStars: '3',
      questionCount: '5',
      status: 'published',
    });
    setLessonModalVisible(true);
  };

  const openEditLessonModal = (chapterId: string, lesson: AdminLesson) => {
    setTargetChapterId(chapterId);
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      icon: lesson.icon,
      rewardStars: String(lesson.rewardStars),
      questionCount: String(lesson.questionCount),
      status: lesson.status,
    });
    setLessonModalVisible(true);
  };

  const handleSaveLesson = async () => {
    if (!targetChapterId) return;
    if (!lessonForm.title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên bài học');
      return;
    }
    await onSaveLesson(targetChapterId, {
      ...(editingLesson ? { id: editingLesson.id } : {}),
      title: lessonForm.title,
      description: lessonForm.description,
      icon: lessonForm.icon,
      rewardStars: Number(lessonForm.rewardStars) || 3,
      questionCount: Number(lessonForm.questionCount) || 5,
      status: lessonForm.status,
    });
    setLessonModalVisible(false);
  };

  // Question Handlers
  const openQuestionsModal = (lesson: AdminLesson) => {
    setActiveLesson(lesson);
    setQuestionsModalVisible(true);
  };

  const openAddQuestionModal = () => {
    setEditingQuestion(null);
    setQuestionForm({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
    });
    setQuestionFormModalVisible(true);
  };

  const openEditQuestionModal = (q: AdminQuestion) => {
    setEditingQuestion(q);
    const opts = q.options || [];
    setQuestionForm({
      questionText: q.questionText,
      optionA: opts[0] || '',
      optionB: opts[1] || '',
      optionC: opts[2] || '',
      optionD: opts[3] || '',
      correctAnswer: q.correctAnswer || 'A',
    });
    setQuestionFormModalVisible(true);
  };

  const handleSaveQuestion = async () => {
    if (!activeLesson) return;
    if (!questionForm.questionText.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung câu hỏi');
      return;
    }

    const options = [
      questionForm.optionA.trim() || '1',
      questionForm.optionB.trim() || '2',
      questionForm.optionC.trim() || '3',
      questionForm.optionD.trim() || '4',
    ];

    if (onSaveQuestion) {
      await onSaveQuestion(activeLesson.id, {
        ...(editingQuestion ? { id: editingQuestion.id } : {}),
        questionText: questionForm.questionText,
        options,
        correctAnswer: questionForm.correctAnswer,
        questionType: 'multiple_choice',
      });
    }

    setQuestionFormModalVisible(false);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!activeLesson || !onDeleteQuestion) return;
    await onDeleteQuestion(activeLesson.id, questionId);
  };

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.topControlRow}>
        <View style={styles.headerInfoGroup}>
          <Text style={styles.headerTitle}>Chương trình học tập</Text>
          <Text style={styles.headerSubtitle}>
            Toàn bộ {chapters.length.toLocaleString('vi-VN')} chương và các bài học trong hệ thống
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addChapterBtn}
          onPress={openAddChapterModal}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.addChapterBtnText}>Thêm chương mới</Text>
        </TouchableOpacity>
      </View>

      {/* Chapters List */}
      <ScrollView style={styles.chapterList}>
        {chapters.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyTitle}>Chưa có chương học nào</Text>
            <Text style={styles.emptySub}>
              Nhấn "Thêm chương mới" để bắt đầu xây dựng giáo trình.
            </Text>
          </View>
        ) : (
          chapters.map((chapter, index) => {
            const isExpanded = expandedChapterId === chapter.id;
            return (
              <View key={chapter.id} style={styles.chapterCard}>
                {/* Chapter Header */}
                <TouchableOpacity
                  style={styles.chapterHeader}
                  onPress={() =>
                    setExpandedChapterId(isExpanded ? null : chapter.id)
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.chapterHeaderLeft}>
                    <View style={styles.chapterIconBox}>
                      <Text style={styles.chapterIconText}>
                        {(index + 1).toLocaleString('vi-VN')}
                      </Text>
                    </View>
                    <View style={styles.chapterTitleGroup}>
                      <View style={styles.chapterBadgeRow}>
                        <Text style={styles.chapterTitle}>{chapter.title}</Text>
                        <View style={styles.lessonCountBadge}>
                          <Text style={styles.lessonCountText}>
                            {(chapter.lessons?.length || 0).toLocaleString('vi-VN')} bài học
                          </Text>
                        </View>
                      </View>
                      {chapter.description ? (
                        <Text style={styles.chapterDesc}>{chapter.description}</Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.chapterHeaderActions}>
                    <AdminTooltipButton
                      tooltip="Sửa chương"
                      style={styles.chapterIconBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        openEditChapterModal(chapter);
                      }}
                    >
                      <Edit3 size={15} color="#475569" />
                    </AdminTooltipButton>
                    <AdminTooltipButton
                      tooltip="Xóa chương"
                      style={[styles.chapterIconBtn, styles.btnDelete]}
                      onPress={(e) => {
                        e.stopPropagation();
                        onDeleteChapter(chapter.id);
                      }}
                    >
                      <Trash2 size={15} color="#DC2626" />
                    </AdminTooltipButton>
                    <View style={styles.chevronBox}>
                      {isExpanded ? (
                        <ChevronDown size={18} color="#64748B" />
                      ) : (
                        <ChevronRight size={18} color="#64748B" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Chapter Expanded Lessons */}
                {isExpanded ? (
                  <View style={styles.lessonsContainer}>
                    <View style={styles.lessonsHeader}>
                      <Text style={styles.lessonsHeading}>DANH SÁCH BÀI HỌC</Text>
                      <TouchableOpacity
                        style={styles.addLessonMiniBtn}
                        onPress={() => openAddLessonModal(chapter.id)}
                      >
                        <Plus size={14} color="#2563EB" strokeWidth={2.5} />
                        <Text style={styles.addLessonMiniText}>Thêm bài học</Text>
                      </TouchableOpacity>
                    </View>

                    {(chapter.lessons?.length || 0) === 0 ? (
                      <View style={styles.emptyLessonsBox}>
                        <Text style={styles.emptyLessonsText}>
                          Chưa có bài học nào trong chương này.
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.lessonGrid}>
                        {(chapter.lessons || []).map((lesson) => {
                          const qCount = lesson.questions
                            ? lesson.questions.length
                            : lesson.questionCount || 0;
                          return (
                            <View key={lesson.id} style={styles.lessonItem}>
                              <View style={styles.lessonItemLeft}>
                                <View style={styles.lessonAvatar}>
                                  <Text style={styles.lessonEmoji}>
                                    {lesson.icon}
                                  </Text>
                                </View>
                                <View style={styles.lessonMeta}>
                                  <Text style={styles.lessonTitle}>
                                    {lesson.title}
                                  </Text>
                                  <Text style={styles.lessonSub}>
                                    {lesson.description || 'Chưa có mô tả'}
                                  </Text>
                                  <View style={styles.lessonPillsRow}>
                                    <View style={styles.lessonPill}>
                                      <Text style={styles.lessonPillText}>
                                        ⭐ {(lesson.rewardStars || 0).toLocaleString('vi-VN')} sao
                                      </Text>
                                    </View>
                                    <View
                                      style={[
                                        styles.lessonPill,
                                        { backgroundColor: '#EFF6FF' },
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.lessonPillText,
                                          { color: '#2563EB', fontWeight: '700' },
                                        ]}
                                      >
                                        ❓ {qCount.toLocaleString('vi-VN')} câu hỏi
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </View>

                              <View style={styles.lessonActions}>
                                <TouchableOpacity
                                  style={styles.manageQuestionsBtn}
                                  onPress={() => openQuestionsModal(lesson)}
                                >
                                  <HelpCircle size={14} color="#16A34A" />
                                  <Text style={styles.manageQuestionsText}>
                                    Câu hỏi
                                  </Text>
                                </TouchableOpacity>
                                <AdminTooltipButton
                                  tooltip="Sửa bài học"
                                  style={styles.lessonActionBtn}
                                  onPress={() =>
                                    openEditLessonModal(chapter.id, lesson)
                                  }
                                >
                                  <Edit3 size={14} color="#2563EB" />
                                  <Text style={styles.lessonActionText}>Sửa</Text>
                                </AdminTooltipButton>
                                <AdminTooltipButton
                                  tooltip="Xóa bài học"
                                  style={[
                                    styles.lessonActionBtn,
                                    styles.lessonActionDelete,
                                  ]}
                                  onPress={() =>
                                    onDeleteLesson(chapter.id, lesson.id)
                                  }
                                >
                                  <Trash2 size={14} color="#DC2626" />
                                </AdminTooltipButton>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Chapter Form Modal */}
      <Modal
        visible={chapterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChapterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingChapter ? 'Sửa thông tin chương' : 'Tạo chương học mới'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setChapterModalVisible(false)}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.formLabel}>Tên chương học</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ví dụ: Chương 1: Làm quen với số đếm từ 1 đến 10"
                value={chapterForm.title}
                onChangeText={(t) =>
                  setChapterForm((prev) => ({ ...prev, title: t }))
                }
              />

              <Text style={styles.formLabel}>Mô tả tóm tắt</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                placeholder="Mục tiêu hoặc kiến thức trọng tâm của chương..."
                multiline
                numberOfLines={3}
                value={chapterForm.description}
                onChangeText={(t) =>
                  setChapterForm((prev) => ({ ...prev, description: t }))
                }
              />

              <TouchableOpacity
                style={styles.formSubmitBtn}
                onPress={handleSaveChapter}
              >
                <Text style={styles.formSubmitText}>Lưu chương học</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Lesson Form Modal */}
      <Modal
        visible={lessonModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLessonModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingLesson ? 'Sửa bài học' : 'Tạo bài học mới'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setLessonModalVisible(false)}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.formLabel}>Tên bài học</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ví dụ: Bài 1: Nhận biết số 1, 2, 3"
                value={lessonForm.title}
                onChangeText={(t) =>
                  setLessonForm((prev) => ({ ...prev, title: t }))
                }
              />

              <Text style={styles.formLabel}>Mô tả bài học</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                placeholder="Nội dung tóm tắt..."
                multiline
                numberOfLines={2}
                value={lessonForm.description}
                onChangeText={(t) =>
                  setLessonForm((prev) => ({ ...prev, description: t }))
                }
              />

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Icon / Emoji</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="🔢"
                    value={lessonForm.icon}
                    onChangeText={(t) =>
                      setLessonForm((prev) => ({ ...prev, icon: t }))
                    }
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Ngôi sao thưởng</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="number-pad"
                    placeholder="3"
                    value={lessonForm.rewardStars}
                    onChangeText={(t) =>
                      setLessonForm((prev) => ({ ...prev, rewardStars: t }))
                    }
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.formSubmitBtn, { marginTop: 18 }]}
                onPress={handleSaveLesson}
              >
                <Text style={styles.formSubmitText}>Lưu bài học</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Questions Manager Modal */}
      <Modal
        visible={questionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQuestionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 700, maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Quản lý câu hỏi: {activeLesson?.title}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Danh sách câu hỏi bài tập tương tác của bài học
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setQuestionsModalVisible(false)}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.questionModalToolbar}>
              <Text style={styles.questionCountLabel}>
                Tổng: {activeLesson?.questions?.length || 0} câu hỏi
              </Text>
              <TouchableOpacity
                style={styles.addQuestionBtn}
                onPress={openAddQuestionModal}
              >
                <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.addQuestionBtnText}>Thêm câu hỏi mới</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.questionsList}>
              {!activeLesson?.questions || activeLesson.questions.length === 0 ? (
                <View style={styles.emptyQuestions}>
                  <Text style={styles.emptyQuestionsEmoji}>❓</Text>
                  <Text style={styles.emptyQuestionsTitle}>
                    Chưa có câu hỏi nào trong bài này
                  </Text>
                  <Text style={styles.emptyQuestionsSub}>
                    Nhấn "Thêm câu hỏi mới" để tạo bài tập cho bé.
                  </Text>
                </View>
              ) : (
                activeLesson.questions.map((q, qIndex) => (
                  <View key={q.id} style={styles.questionItemCard}>
                    <View style={styles.questionItemHeader}>
                      <View style={styles.questionNumberBadge}>
                        <Text style={styles.questionNumberText}>
                          Câu {qIndex + 1}
                        </Text>
                      </View>
                      <Text style={styles.questionItemText}>
                        {q.questionText}
                      </Text>
                      <View style={styles.questionItemActions}>
                        <AdminTooltipButton
                          tooltip="Sửa câu hỏi"
                          style={styles.qActionBtn}
                          onPress={() => openEditQuestionModal(q)}
                        >
                          <Edit3 size={14} color="#2563EB" />
                        </AdminTooltipButton>
                        <AdminTooltipButton
                          tooltip="Xóa câu hỏi"
                          style={[styles.qActionBtn, styles.qActionDelete]}
                          onPress={() => handleDeleteQuestion(q.id)}
                        >
                          <Trash2 size={14} color="#DC2626" />
                        </AdminTooltipButton>
                      </View>
                    </View>

                    {/* Options list */}
                    <View style={styles.optionsGrid}>
                      {(q.options || []).map((opt, oIdx) => {
                        const letter = ['A', 'B', 'C', 'D'][oIdx];
                        const isCorrect = q.correctAnswer === letter || q.correctAnswer === opt;
                        return (
                          <View
                            key={oIdx}
                            style={[
                              styles.optionPill,
                              isCorrect && styles.optionPillCorrect,
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionLetter,
                                isCorrect && styles.optionLetterCorrect,
                              ]}
                            >
                              {letter}.
                            </Text>
                            <Text
                              style={[
                                styles.optionText,
                                isCorrect && styles.optionTextCorrect,
                              ]}
                            >
                              {opt}
                            </Text>
                            {isCorrect ? (
                              <Check size={13} color="#16A34A" strokeWidth={3} />
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Question Form Modal (Create / Edit) */}
      <Modal
        visible={questionFormModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQuestionFormModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 540 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingQuestion ? 'Sửa câu hỏi' : 'Tạo câu hỏi mới'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setQuestionFormModalVisible(false)}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.formLabel}>Nội dung câu hỏi</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                placeholder="Ví dụ: Có bao nhiêu quả táo trong hình?"
                multiline
                numberOfLines={2}
                value={questionForm.questionText}
                onChangeText={(t) =>
                  setQuestionForm((prev) => ({ ...prev, questionText: t }))
                }
              />

              <Text style={[styles.formLabel, { marginTop: 6 }]}>
                4 Lựa chọn trả lời
              </Text>
              {(['optionA', 'optionB', 'optionC', 'optionD'] as const).map(
                (field, fIdx) => {
                  const letter = ['A', 'B', 'C', 'D'][fIdx];
                  const isCorrect = questionForm.correctAnswer === letter;
                  return (
                    <View key={field} style={styles.optionInputRow}>
                      <TouchableOpacity
                        style={[
                          styles.correctRadioBtn,
                          isCorrect && styles.correctRadioBtnActive,
                        ]}
                        onPress={() =>
                          setQuestionForm((prev) => ({
                            ...prev,
                            correctAnswer: letter,
                          }))
                        }
                      >
                        <Text
                          style={[
                            styles.correctRadioText,
                            isCorrect && styles.correctRadioTextActive,
                          ]}
                        >
                          {letter}
                        </Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[
                          styles.formInput,
                          { flex: 1 },
                          isCorrect && { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' },
                        ]}
                        placeholder={`Đáp án ${letter}`}
                        value={questionForm[field]}
                        onChangeText={(t) =>
                          setQuestionForm((prev) => ({ ...prev, [field]: t }))
                        }
                      />
                    </View>
                  );
                }
              )}
              <Text style={styles.radioHint}>
                * Nhấn vào chữ cái (A, B, C, D) để chọn làm đáp án đúng.
              </Text>

              <TouchableOpacity
                style={[styles.formSubmitBtn, { marginTop: 16 }]}
                onPress={handleSaveQuestion}
              >
                <Text style={styles.formSubmitText}>Lưu câu hỏi</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 28,
    gap: 20,
  },
  topControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerInfoGroup: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  addChapterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  addChapterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chapterList: {
    maxHeight: 700,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  chapterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    overflow: 'visible',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  chapterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  chapterIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterIconText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  chapterTitleGroup: {
    flex: 1,
  },
  chapterBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  lessonCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lessonCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  chapterDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  chapterHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chapterIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDelete: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  chevronBox: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonsContainer: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 16,
    gap: 12,
  },
  lessonsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonsHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  addLessonMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  addLessonMiniText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyLessonsBox: {
    padding: 20,
    alignItems: 'center',
  },
  emptyLessonsText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  lessonGrid: {
    gap: 10,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    flexWrap: 'wrap',
    gap: 10,
  },
  lessonItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 240,
  },
  lessonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonEmoji: {
    fontSize: 20,
  },
  lessonMeta: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  lessonSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  lessonPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  lessonPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lessonPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  lessonActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  manageQuestionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  manageQuestionsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  lessonActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  lessonActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  lessonActionDelete: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
  },

  // Modal Common
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 520,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalBody: {
    padding: 20,
    gap: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    outlineStyle: 'none' as any,
  },
  formTextarea: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formCol: {
    flex: 1,
    gap: 6,
  },
  formSubmitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  formSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Question Management Specific
  questionModalToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  questionCountLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  addQuestionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addQuestionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  questionsList: {
    padding: 20,
    maxHeight: 460,
  },
  emptyQuestions: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyQuestionsEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyQuestionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyQuestionsSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  questionItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  questionItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  questionNumberBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  questionNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  questionItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  questionItemActions: {
    flexDirection: 'row',
    gap: 6,
  },
  qActionBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qActionDelete: {
    backgroundColor: '#FEE2E2',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexBasis: '48%',
    flexGrow: 1,
  },
  optionPillCorrect: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  optionLetterCorrect: {
    color: '#16A34A',
  },
  optionText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
  },
  optionTextCorrect: {
    color: '#15803D',
    fontWeight: '700',
  },
  optionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  correctRadioBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctRadioBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  correctRadioText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  correctRadioTextActive: {
    color: '#15803D',
  },
  radioHint: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
