import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {CookingModeSettings as SettingsType} from '../../types/cookingMode';
import {colors, typography, spacing} from '../../theme';

interface CookingModeSettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  onClose: () => void;
}

export const CookingModeSettings: React.FC<CookingModeSettingsProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const textSizeOptions = [
    {key: 'small', label: 'Pequeno'},
    {key: 'medium', label: 'Médio'},
    {key: 'large', label: 'Grande'},
    {key: 'extra-large', label: 'Extra Grande'},
  ];

  const themeOptions = [
    {key: 'light', label: 'Claro'},
    {key: 'dark', label: 'Escuro'},
    {key: 'high-contrast', label: 'Alto Contraste'},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.title}>Configurações</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exibição</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Manter tela ligada</Text>
              <Text style={styles.settingDescription}>
                Impede que a tela desligue durante o cozimento
              </Text>
            </View>
            <Switch
              value={settings.keepScreenOn}
              onValueChange={(value) => onUpdateSettings({keepScreenOn: value})}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Tamanho do texto</Text>
            <View style={styles.optionsRow}>
              {textSizeOptions.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionButton,
                    settings.textSize === option.key && styles.selectedOption,
                  ]}
                  onPress={() => onUpdateSettings({textSize: option.key as any})}
                >
                  <Text
                    style={[
                      styles.optionText,
                      settings.textSize === option.key && styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Tema</Text>
            <View style={styles.optionsRow}>
              {themeOptions.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionButton,
                    settings.theme === option.key && styles.selectedOption,
                  ]}
                  onPress={() => onUpdateSettings({theme: option.key as any})}
                >
                  <Text
                    style={[
                      styles.optionText,
                      settings.theme === option.key && styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Voice Control */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controle por Voz</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Ativar controle por voz</Text>
              <Text style={styles.settingDescription}>
                Permite navegar usando comandos de voz
              </Text>
            </View>
            <Switch
              value={settings.voiceControlEnabled}
              onValueChange={(value) => onUpdateSettings({voiceControlEnabled: value})}
            />
          </View>
        </View>

        {/* Automation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Automação</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Avançar passos automaticamente</Text>
              <Text style={styles.settingDescription}>
                Avança para o próximo passo após marcar como concluído
              </Text>
            </View>
            <Switch
              value={settings.autoAdvanceSteps}
              onValueChange={(value) => onUpdateSettings({autoAdvanceSteps: value})}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Iniciar timers automaticamente</Text>
              <Text style={styles.settingDescription}>
                Inicia timers sugeridos automaticamente
              </Text>
            </View>
            <Switch
              value={settings.autoStartTimers}
              onValueChange={(value) => onUpdateSettings({autoStartTimers: value})}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Som dos timers</Text>
              <Text style={styles.settingDescription}>
                Reproduz som quando timers terminam
              </Text>
            </View>
            <Switch
              value={settings.timerSoundEnabled}
              onValueChange={(value) => onUpdateSettings({timerSoundEnabled: value})}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Vibração dos timers</Text>
              <Text style={styles.settingDescription}>
                Vibra quando timers terminam
              </Text>
            </View>
            <Switch
              value={settings.timerVibrationEnabled}
              onValueChange={(value) => onUpdateSettings({timerVibrationEnabled: value})}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conteúdo</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Mostrar checklist de ingredientes</Text>
              <Text style={styles.settingDescription}>
                Exibe lista de ingredientes para marcar
              </Text>
            </View>
            <Switch
              value={settings.showIngredientChecklist}
              onValueChange={(value) => onUpdateSettings({showIngredientChecklist: value})}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Mostrar dicas</Text>
              <Text style={styles.settingDescription}>
                Exibe dicas úteis durante o preparo
              </Text>
            </View>
            <Switch
              value={settings.showTips}
              onValueChange={(value) => onUpdateSettings({showTips: value})}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Mostrar informações nutricionais</Text>
              <Text style={styles.settingDescription}>
                Exibe dados nutricionais da receita
              </Text>
            </View>
            <Switch
              value={settings.showNutritionInfo}
              onValueChange={(value) => onUpdateSettings({showNutritionInfo: value})}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    ...typography.title,
    color: colors.gray[900],
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  sectionTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.gray[600],
    lineHeight: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  optionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  selectedOption: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  optionText: {
    ...typography.caption,
    color: colors.gray[700],
    fontWeight: '500',
  },
  selectedOptionText: {
    color: colors.white,
  },
});