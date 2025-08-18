import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Switch,
  Text,
  TextInput,
  IconButton,
} from 'react-native-paper';
import {useAuth} from '@/hooks/useAuth';
import {showToast} from '@/store/slices/uiSlice';
import {useAppDispatch} from '@/store';
import {ScreenProps} from '@/types';

interface ProfileScreenProps extends ScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const {
    user,
    logout,
    updateUserProfile,
    isUpdatingProfile,
    removeAccount,
    isDeletingAccount,
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    isPublic: user?.isPublic || false,
  });

  const handleSaveProfile = async () => {
    const result = await updateUserProfile(editData);

    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      isPublic: user?.isPublic || false,
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirmar logout',
      'Tem certeza que deseja sair da sua conta?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Deletar conta',
      'Esta ação é irreversível. Todos os seus dados serão perdidos permanentemente.',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: () => {
            // Navegar para tela de confirmação de deleção
            navigation.navigate('DeleteAccount');
          },
        },
      ],
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header do perfil */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Image
                size={80}
                source={{uri: user.avatar || 'https://via.placeholder.com/80'}}
              />
              <IconButton
                icon="camera"
                size={20}
                mode="contained"
                style={styles.avatarEditButton}
                onPress={() => {
                  // Implementar seleção de avatar
                  dispatch(
                    showToast({
                      message: 'Funcionalidade em desenvolvimento',
                      type: 'info',
                    }),
                  );
                }}
              />
            </View>

            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  label="Nome"
                  value={editData.displayName}
                  onChangeText={text =>
                    setEditData(prev => ({...prev, displayName: text}))
                  }
                  style={styles.editInput}
                />
                <TextInput
                  label="Bio"
                  value={editData.bio}
                  onChangeText={text =>
                    setEditData(prev => ({...prev, bio: text}))
                  }
                  multiline
                  numberOfLines={3}
                  style={styles.editInput}
                />

                <View style={styles.switchContainer}>
                  <Text variant="bodyMedium">Perfil público</Text>
                  <Switch
                    value={editData.isPublic}
                    onValueChange={value =>
                      setEditData(prev => ({...prev, isPublic: value}))
                    }
                  />
                </View>

                <View style={styles.editButtons}>
                  <Button
                    mode="outlined"
                    onPress={handleCancelEdit}
                    style={styles.editButton}>
                    Cancelar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSaveProfile}
                    loading={isUpdatingProfile}
                    style={styles.editButton}>
                    Salvar
                  </Button>
                </View>
              </View>
            ) : (
              <View style={styles.profileInfo}>
                <View style={styles.nameContainer}>
                  <Text variant="headlineSmall" style={styles.displayName}>
                    {user.displayName}
                  </Text>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => setIsEditing(true)}
                  />
                </View>

                <Text variant="bodyMedium" style={styles.username}>
                  @{user.username}
                </Text>

                {user.bio && (
                  <Text variant="bodyMedium" style={styles.bio}>
                    {user.bio}
                  </Text>
                )}

                <View style={styles.statsContainer}>
                  <View style={styles.stat}>
                    <Text variant="titleMedium" style={styles.statNumber}>
                      {user.recipesCount}
                    </Text>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      Receitas
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text variant="titleMedium" style={styles.statNumber}>
                      {user.followersCount}
                    </Text>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      Seguidores
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text variant="titleMedium" style={styles.statNumber}>
                      {user.followingCount}
                    </Text>
                    <Text variant="bodySmall" style={styles.statLabel}>
                      Seguindo
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Menu de opções */}
        <Card style={styles.menuCard}>
          <List.Item
            title="Minhas receitas"
            description="Gerencie suas receitas"
            left={props => <List.Icon {...props} icon="book-open" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('MyRecipes')}
          />
          <Divider />
          <List.Item
            title="Favoritos"
            description="Suas receitas favoritas"
            left={props => <List.Icon {...props} icon="heart" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Favorites')}
          />
          <Divider />
          <List.Item
            title="Planejamento"
            description="Meal plans e listas de compras"
            left={props => <List.Icon {...props} icon="calendar" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Planning')}
          />
          <Divider />
          <List.Item
            title="Configurações"
            description="Preferências e notificações"
            left={props => <List.Icon {...props} icon="cog" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Settings')}
          />
        </Card>

        {/* Ações da conta */}
        <Card style={styles.actionsCard}>
          <List.Item
            title="Alterar senha"
            left={props => <List.Icon {...props} icon="lock" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <Divider />
          <List.Item
            title="Privacidade"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Privacy')}
          />
          <Divider />
          <List.Item
            title="Ajuda e suporte"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Support')}
          />
        </Card>

        {/* Botões de ação */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            icon="logout">
            Sair da conta
          </Button>

          <Button
            mode="text"
            onPress={handleDeleteAccount}
            style={styles.deleteButton}
            textColor="#d32f2f">
            Deletar conta
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FF6B35',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  displayName: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  username: {
    opacity: 0.7,
    marginBottom: 8,
  },
  bio: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 2,
  },
  editContainer: {
    width: '100%',
  },
  editInput: {
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  menuCard: {
    marginBottom: 16,
  },
  actionsCard: {
    marginBottom: 24,
  },
  actionButtons: {
    gap: 12,
  },
  logoutButton: {
    borderColor: '#FF6B35',
  },
  deleteButton: {
    alignSelf: 'center',
  },
});

export default ProfileScreen;
