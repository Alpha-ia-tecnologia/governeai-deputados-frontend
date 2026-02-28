import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Modal,
    ScrollView,
} from "react-native";
import { Cake, Gift, ChevronRight, X, Phone, MapPin, Calendar, User } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Voter, Leader } from "@/types";
import Colors from "@/constants/colors";

interface BirthdayPerson {
    id: string;
    name: string;
    birthDate: string;
    type: "voter" | "leader";
    phone?: string;
    neighborhood?: string;
    region?: string;
    email?: string;
    leaderName?: string;
}

interface BirthdayWidgetProps {
    voters: Voter[];
    leaders: Leader[];
}

export function BirthdayWidget({ voters, leaders }: BirthdayWidgetProps) {
    const { colors } = useTheme();
    const [selectedPerson, setSelectedPerson] = useState<BirthdayPerson | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const { todayBirthdays, upcomingBirthdays } = useMemo(() => {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayDay = today.getDate();

        const allPeople: BirthdayPerson[] = [];

        // Add voters with birthDate
        voters.forEach((voter) => {
            if (voter.birthDate) {
                allPeople.push({
                    id: voter.id,
                    name: voter.name,
                    birthDate: voter.birthDate,
                    type: "voter",
                    phone: voter.phone,
                    neighborhood: voter.neighborhood,
                    leaderName: voter.leaderName,
                });
            }
        });

        // Add leaders with birthDate
        leaders.forEach((leader) => {
            if (leader.birthDate) {
                allPeople.push({
                    id: leader.id,
                    name: leader.name,
                    birthDate: leader.birthDate,
                    type: "leader",
                    phone: leader.phone,
                    region: leader.region,
                    email: leader.email,
                });
            }
        });

        const todayList: BirthdayPerson[] = [];
        const upcomingList: (BirthdayPerson & { daysUntil: number })[] = [];

        allPeople.forEach((person) => {
            const birthDate = new Date(person.birthDate);
            const birthMonth = birthDate.getMonth();
            const birthDay = birthDate.getDate();

            if (birthMonth === todayMonth && birthDay === todayDay) {
                todayList.push(person);
            } else {
                // Calculate days until birthday
                const nextBirthday = new Date(today.getFullYear(), birthMonth, birthDay);
                if (nextBirthday < today) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }

                const diffTime = nextBirthday.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 0 && diffDays <= 7) {
                    upcomingList.push({ ...person, daysUntil: diffDays });
                }
            }
        });

        // Sort upcoming by days until
        upcomingList.sort((a, b) => a.daysUntil - b.daysUntil);

        return {
            todayBirthdays: todayList,
            upcomingBirthdays: upcomingList.slice(0, 5), // Limit to 5
        };
    }, [voters, leaders]);

    const calculateAge = (birthDateStr: string) => {
        const birthDate = new Date(birthDateStr);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age + 1; // +1 because we're showing the age they're turning
    };

    const handlePersonPress = (person: BirthdayPerson) => {
        setSelectedPerson(person);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setSelectedPerson(null);
    };

    const renderBirthdayCard = (person: BirthdayPerson, isToday: boolean, daysUntil?: number) => (
        <TouchableOpacity
            key={person.id}
            style={[
                styles.birthdayCard,
                { backgroundColor: colors.background },
                isToday && styles.todayCard,
            ]}
            onPress={() => handlePersonPress(person)}
            activeOpacity={0.7}
        >
            <View
                style={[
                    styles.avatar,
                    {
                        backgroundColor: isToday
                            ? Colors.light.warning + "20"
                            : person.type === "leader"
                                ? Colors.light.primary + "20"
                                : Colors.light.success + "20",
                    },
                ]}
            >
                <Text
                    style={[
                        styles.avatarText,
                        {
                            color: isToday
                                ? Colors.light.warning
                                : person.type === "leader"
                                    ? Colors.light.primary
                                    : Colors.light.success,
                        },
                    ]}
                >
                    {person.name.charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.cardInfo}>
                <Text style={[styles.personName, { color: colors.text }]} numberOfLines={1}>
                    {person.name}
                </Text>
                <View style={styles.cardMeta}>
                    <View
                        style={[
                            styles.typeBadge,
                            {
                                backgroundColor:
                                    person.type === "leader"
                                        ? Colors.light.primary + "15"
                                        : Colors.light.success + "15",
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.typeBadgeText,
                                {
                                    color:
                                        person.type === "leader"
                                            ? Colors.light.primary
                                            : Colors.light.success,
                                },
                            ]}
                        >
                            {person.type === "leader" ? "Liderança" : "Eleitor"}
                        </Text>
                    </View>
                    {daysUntil && (
                        <Text style={[styles.daysText, { color: colors.textSecondary }]}>
                            em {daysUntil} dia{daysUntil > 1 ? "s" : ""}
                        </Text>
                    )}
                </View>
            </View>
            {isToday ? (
                <Gift color={Colors.light.warning} size={20} />
            ) : (
                <ChevronRight color={colors.textSecondary} size={18} />
            )}
        </TouchableOpacity>
    );

    if (todayBirthdays.length === 0 && upcomingBirthdays.length === 0) {
        return null;
    }

    return (
        <>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Cake color={Colors.light.warning} size={22} />
                        <Text style={[styles.title, { color: colors.text }]}>Aniversários</Text>
                    </View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {todayBirthdays.length + upcomingBirthdays.length}
                        </Text>
                    </View>
                </View>

                {todayBirthdays.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.todayIndicator} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Hoje 🎉
                            </Text>
                        </View>
                        {todayBirthdays.map((person) => renderBirthdayCard(person, true))}
                    </View>
                )}

                {upcomingBirthdays.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                            Próximos 7 dias
                        </Text>
                        {upcomingBirthdays.map((person) =>
                            renderBirthdayCard(person, false, person.daysUntil)
                        )}
                    </View>
                )}
            </View>

            {/* Modal de Detalhes do Aniversariante */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        {selectedPerson && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                                        🎂 Aniversariante
                                    </Text>
                                    <TouchableOpacity onPress={closeModal}>
                                        <X color={colors.text} size={24} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.modalBody}>
                                    {/* Avatar e Nome */}
                                    <View style={styles.modalPersonHeader}>
                                        <View style={[
                                            styles.modalAvatar,
                                            {
                                                backgroundColor: selectedPerson.type === "leader"
                                                    ? Colors.light.primary + "20"
                                                    : Colors.light.success + "20"
                                            }
                                        ]}>
                                            <Text style={[
                                                styles.modalAvatarText,
                                                {
                                                    color: selectedPerson.type === "leader"
                                                        ? Colors.light.primary
                                                        : Colors.light.success,
                                                }
                                            ]}>
                                                {selectedPerson.name.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={styles.modalPersonInfo}>
                                            <Text style={[styles.modalPersonName, { color: colors.text }]}>
                                                {selectedPerson.name}
                                            </Text>
                                            <View
                                                style={[
                                                    styles.modalTypeBadge,
                                                    {
                                                        backgroundColor: selectedPerson.type === "leader"
                                                            ? Colors.light.primary + "15"
                                                            : Colors.light.success + "15",
                                                    },
                                                ]}
                                            >
                                                <User
                                                    color={selectedPerson.type === "leader" ? Colors.light.primary : Colors.light.success}
                                                    size={14}
                                                />
                                                <Text
                                                    style={[
                                                        styles.modalTypeBadgeText,
                                                        {
                                                            color: selectedPerson.type === "leader"
                                                                ? Colors.light.primary
                                                                : Colors.light.success,
                                                        },
                                                    ]}
                                                >
                                                    {selectedPerson.type === "leader" ? "Liderança" : "Eleitor"}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Informações do Aniversário */}
                                    <View style={[styles.birthdayInfoCard, { backgroundColor: Colors.light.warning + "10" }]}>
                                        <Cake color={Colors.light.warning} size={32} />
                                        <View style={styles.birthdayInfoContent}>
                                            <Text style={[styles.birthdayInfoLabel, { color: colors.textSecondary }]}>
                                                Data de Nascimento
                                            </Text>
                                            <Text style={[styles.birthdayInfoValue, { color: colors.text }]}>
                                                {new Date(selectedPerson.birthDate).toLocaleDateString("pt-BR", {
                                                    day: "2-digit",
                                                    month: "long",
                                                    year: "numeric"
                                                })}
                                            </Text>
                                            <Text style={styles.ageText}>
                                                Completando {calculateAge(selectedPerson.birthDate)} anos
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Informações de Contato */}
                                    <View style={styles.detailSection}>
                                        <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                                            Informações de Contato
                                        </Text>

                                        {selectedPerson.phone && (
                                            <View style={styles.detailItem}>
                                                <Phone color={Colors.light.primary} size={20} />
                                                <Text style={[styles.detailItemText, { color: colors.text }]}>
                                                    {selectedPerson.phone}
                                                </Text>
                                            </View>
                                        )}

                                        {selectedPerson.email && (
                                            <View style={styles.detailItem}>
                                                <Calendar color={Colors.light.primary} size={20} />
                                                <Text style={[styles.detailItemText, { color: colors.text }]}>
                                                    {selectedPerson.email}
                                                </Text>
                                            </View>
                                        )}

                                        {(selectedPerson.neighborhood || selectedPerson.region) && (
                                            <View style={styles.detailItem}>
                                                <MapPin color={Colors.light.primary} size={20} />
                                                <Text style={[styles.detailItemText, { color: colors.text }]}>
                                                    {selectedPerson.neighborhood || selectedPerson.region}
                                                </Text>
                                            </View>
                                        )}

                                        {selectedPerson.leaderName && (
                                            <View style={styles.detailItem}>
                                                <User color={Colors.light.primary} size={20} />
                                                <Text style={[styles.detailItemText, { color: colors.text }]}>
                                                    Liderança: {selectedPerson.leaderName}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, { backgroundColor: Colors.light.primary }]}
                                        onPress={closeModal}
                                    >
                                        <Text style={styles.modalButtonText}>Fechar</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            },
        }),
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    badge: {
        backgroundColor: Colors.light.warning,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
    section: {
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    todayIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.light.warning,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    birthdayCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    todayCard: {
        borderColor: Colors.light.warning + "40",
        borderWidth: 2,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "700",
    },
    cardInfo: {
        flex: 1,
    },
    personName: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 4,
    },
    cardMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 11,
        fontWeight: "600",
    },
    daysText: {
        fontSize: 12,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        width: "100%",
        maxWidth: 420,
        maxHeight: "80%",
        borderRadius: 16,
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    modalBody: {
        padding: 16,
    },
    modalPersonHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    modalAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    modalAvatarText: {
        fontSize: 28,
        fontWeight: "700",
    },
    modalPersonInfo: {
        flex: 1,
    },
    modalPersonName: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
    },
    modalTypeBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    modalTypeBadgeText: {
        fontSize: 13,
        fontWeight: "600",
    },
    birthdayInfoCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        gap: 16,
    },
    birthdayInfoContent: {
        flex: 1,
    },
    birthdayInfoLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    birthdayInfoValue: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    ageText: {
        fontSize: 14,
        color: Colors.light.warning,
        fontWeight: "600",
    },
    detailSection: {
        marginBottom: 16,
    },
    detailSectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    detailItemText: {
        fontSize: 15,
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
    },
    modalButton: {
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default BirthdayWidget;
