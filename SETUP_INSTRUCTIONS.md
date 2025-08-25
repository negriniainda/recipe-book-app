# Instruções de Configuração - Sistema OCR

## Dependências Necessárias

O sistema de OCR já tem as dependências instaladas:
- `react-native-image-picker` - Para captura de imagens
- `react-native-paper` - Para componentes de UI

## Configurações Necessárias para Execução

### Android

Quando o projeto for executado, será necessário adicionar as seguintes permissões no `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### iOS

No `ios/RecipeBookApp/Info.plist`, adicionar:

```xml
<key>NSCameraUsageDescription</key>
<string>Este app precisa acessar a câmera para capturar fotos de receitas</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Este app precisa acessar a galeria para selecionar fotos de receitas</string>
```

## API de OCR

O sistema está configurado para usar uma API de OCR externa. Para funcionar completamente, será necessário:

1. Configurar um serviço de OCR (Google Vision API, AWS Textract, ou similar)
2. Implementar o backend que processa as imagens
3. Configurar as URLs da API no arquivo de configuração

## Funcionalidades Implementadas

✅ **Captura de Imagem**
- Câmera e galeria
- Validação de qualidade
- Preview da imagem

✅ **Interface de OCR**
- Indicador de progresso
- Editor de texto extraído
- Estruturação automática

✅ **Processamento de Texto**
- Limpeza automática
- Estruturação em receita
- Validação de dados

✅ **Integração com Navegação**
- Tela dedicada para OCR
- Botão de acesso no ImportScreen
- Fluxo completo de importação

## Próximos Passos

1. Configurar API de OCR real
2. Testar em dispositivo físico
3. Ajustar algoritmos de parsing
4. Implementar cache offline