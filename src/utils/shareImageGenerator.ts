import {ShareTemplate, ShareableContent, ShareImageDimensions} from '../types/sharing';

// Dimensões padrão para diferentes plataformas
export const SHARE_DIMENSIONS: ShareImageDimensions = {
  instagram_post: {width: 1080, height: 1080},
  instagram_story: {width: 1080, height: 1920},
  facebook_post: {width: 1200, height: 630},
  twitter_post: {width: 1200, height: 675},
  whatsapp_status: {width: 1080, height: 1920},
  generic: {width: 1200, height: 800},
};

// Templates padrão para diferentes tipos de conteúdo
export const DEFAULT_TEMPLATES: Partial<ShareTemplate>[] = [
  {
    name: 'Card Clássico',
    platform: 'instagram',
    format: 'image',
    contentType: 'recipe',
    template: {
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      accentColor: '#F59E0B',
      layout: 'card',
      showLogo: true,
      showQRCode: true,
      showIngredients: true,
      showSteps: false,
      showNutrition: false,
      showRating: true,
      showCookTime: true,
      showServings: true,
    },
    dimensions: SHARE_DIMENSIONS.instagram_post,
    isDefault: true,
  },
  {
    name: 'Story Minimalista',
    platform: 'instagram',
    format: 'story',
    contentType: 'recipe',
    template: {
      backgroundColor: '#F3F4F6',
      textColor: '#111827',
      accentColor: '#EF4444',
      layout: 'story',
      showLogo: false,
      showQRCode: true,
      showIngredients: false,
      showSteps: true,
      showNutrition: false,
      showRating: false,
      showCookTime: true,
      showServings: true,
    },
    dimensions: SHARE_DIMENSIONS.instagram_story,
    isDefault: false,
  },
  {
    name: 'Post Facebook',
    platform: 'facebook',
    format: 'post',
    contentType: 'recipe',
    template: {
      backgroundColor: '#1F2937',
      textColor: '#FFFFFF',
      accentColor: '#10B981',
      layout: 'post',
      showLogo: true,
      showQRCode: false,
      showIngredients: true,
      showSteps: false,
      showNutrition: true,
      showRating: true,
      showCookTime: true,
      showServings: true,
    },
    dimensions: SHARE_DIMENSIONS.facebook_post,
    isDefault: false,
  },
  {
    name: 'Tweet Compacto',
    platform: 'twitter',
    format: 'image',
    contentType: 'recipe',
    template: {
      backgroundColor: '#EFF6FF',
      textColor: '#1E40AF',
      accentColor: '#3B82F6',
      layout: 'minimal',
      showLogo: false,
      showQRCode: false,
      showIngredients: false,
      showSteps: false,
      showNutrition: false,
      showRating: true,
      showCookTime: true,
      showServings: false,
    },
    dimensions: SHARE_DIMENSIONS.twitter_post,
    isDefault: false,
  },
];

/**
 * Gera HTML para renderização de imagem de compartilhamento
 */
export const generateShareImageHTML = (
  content: ShareableContent,
  template: ShareTemplate
): string => {
  const {dimensions, template: templateConfig} = template;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: ${dimensions.width}px;
          height: ${dimensions.height}px;
          background-color: ${templateConfig.backgroundColor};
          color: ${templateConfig.textColor};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }
        
        .container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          position: relative;
        }
        
        .logo {
          position: absolute;
          top: 20px;
          left: 20px;
          font-size: 18px;
          font-weight: bold;
          color: ${templateConfig.accentColor};
        }
        
        .qr-code {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 80px;
          height: 80px;
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          text-align: center;
        }
        
        .recipe-image {
          width: 200px;
          height: 200px;
          border-radius: 16px;
          object-fit: cover;
          margin-bottom: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .title {
          font-size: ${templateConfig.layout === 'story' ? '32px' : '28px'};
          font-weight: bold;
          margin-bottom: 16px;
          line-height: 1.2;
          max-width: 80%;
        }
        
        .description {
          font-size: 16px;
          opacity: 0.8;
          margin-bottom: 24px;
          max-width: 70%;
          line-height: 1.4;
        }
        
        .meta-info {
          display: flex;
          gap: 24px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .meta-icon {
          width: 16px;
          height: 16px;
          background-color: ${templateConfig.accentColor};
          border-radius: 50%;
        }
        
        .ingredients {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          max-width: 80%;
        }
        
        .ingredients-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 12px;
          color: ${templateConfig.accentColor};
        }
        
        .ingredients-list {
          font-size: 14px;
          line-height: 1.6;
          text-align: left;
        }
        
        .steps {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          max-width: 80%;
        }
        
        .steps-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 12px;
          color: ${templateConfig.accentColor};
        }
        
        .step {
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 8px;
          text-align: left;
        }
        
        .nutrition {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .nutrition-item {
          text-align: center;
          font-size: 12px;
        }
        
        .nutrition-value {
          font-size: 16px;
          font-weight: bold;
          color: ${templateConfig.accentColor};
        }
        
        .rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .stars {
          display: flex;
          gap: 2px;
        }
        
        .star {
          width: 16px;
          height: 16px;
          background-color: ${templateConfig.accentColor};
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        }
        
        .watermark {
          position: absolute;
          bottom: 20px;
          left: 20px;
          font-size: 12px;
          opacity: 0.6;
        }
        
        /* Layout específico para story */
        .story-layout {
          padding: 60px 40px;
          justify-content: flex-start;
        }
        
        .story-layout .recipe-image {
          width: 100%;
          height: 300px;
          margin-bottom: 30px;
        }
        
        .story-layout .title {
          font-size: 36px;
          margin-bottom: 20px;
        }
        
        /* Layout específico para post */
        .post-layout {
          flex-direction: row;
          padding: 40px;
        }
        
        .post-layout .content-left {
          flex: 1;
          padding-right: 40px;
        }
        
        .post-layout .content-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .post-layout .recipe-image {
          width: 100%;
          height: 100%;
          margin-bottom: 0;
        }
        
        /* Layout minimalista */
        .minimal-layout {
          padding: 60px;
        }
        
        .minimal-layout .recipe-image {
          width: 150px;
          height: 150px;
          margin-bottom: 24px;
        }
        
        .minimal-layout .title {
          font-size: 24px;
          margin-bottom: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container ${templateConfig.layout}-layout">
        ${templateConfig.showLogo ? '<div class="logo">RecipeApp</div>' : ''}
        
        ${templateConfig.layout === 'post' ? `
          <div class="content-left">
            ${content.imageUrl ? `<img src="${content.imageUrl}" alt="${content.title}" class="recipe-image">` : ''}
          </div>
          <div class="content-right">
        ` : ''}
        
        ${templateConfig.layout !== 'post' && content.imageUrl ? `<img src="${content.imageUrl}" alt="${content.title}" class="recipe-image">` : ''}
        
        <h1 class="title">${content.title}</h1>
        
        ${content.description ? `<p class="description">${content.description}</p>` : ''}
        
        <div class="meta-info">
          ${templateConfig.showCookTime ? `
            <div class="meta-item">
              <div class="meta-icon"></div>
              <span>30 min</span>
            </div>
          ` : ''}
          
          ${templateConfig.showServings ? `
            <div class="meta-item">
              <div class="meta-icon"></div>
              <span>4 porções</span>
            </div>
          ` : ''}
          
          ${templateConfig.showRating ? `
            <div class="rating">
              <div class="stars">
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
                <div class="star"></div>
              </div>
              <span>4.8</span>
            </div>
          ` : ''}
        </div>
        
        ${templateConfig.showIngredients ? `
          <div class="ingredients">
            <h3 class="ingredients-title">Ingredientes</h3>
            <div class="ingredients-list">
              • 2 xícaras de farinha de trigo<br>
              • 1 xícara de açúcar<br>
              • 3 ovos<br>
              • 1/2 xícara de óleo<br>
              • 1 colher de sopa de fermento
            </div>
          </div>
        ` : ''}
        
        ${templateConfig.showSteps ? `
          <div class="steps">
            <h3 class="steps-title">Modo de Preparo</h3>
            <div class="step">1. Misture os ingredientes secos</div>
            <div class="step">2. Adicione os líquidos</div>
            <div class="step">3. Asse por 30 minutos</div>
          </div>
        ` : ''}
        
        ${templateConfig.showNutrition ? `
          <div class="nutrition">
            <div class="nutrition-item">
              <div class="nutrition-value">250</div>
              <div>kcal</div>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-value">12g</div>
              <div>proteína</div>
            </div>
            <div class="nutrition-item">
              <div class="nutrition-value">8g</div>
              <div>gordura</div>
            </div>
          </div>
        ` : ''}
        
        ${templateConfig.layout === 'post' ? '</div>' : ''}
        
        ${templateConfig.showQRCode ? '<div class="qr-code">QR Code</div>' : ''}
        
        ${templateConfig.watermark ? `<div class="watermark">${templateConfig.watermark}</div>` : ''}
        
        ${templateConfig.customText ? `<div class="watermark">${templateConfig.customText}</div>` : ''}
      </div>
    </body>
    </html>
  `;
};

/**
 * Gera configurações de template baseado na plataforma
 */
export const getTemplateForPlatform = (platform: string, contentType: string): Partial<ShareTemplate> => {
  const baseTemplate = DEFAULT_TEMPLATES.find(
    t => t.platform === platform && t.contentType === contentType
  );
  
  if (baseTemplate) {
    return baseTemplate;
  }
  
  // Template genérico se não encontrar específico
  return {
    name: 'Template Genérico',
    platform: platform as any,
    format: 'image',
    contentType: contentType as any,
    template: {
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      accentColor: '#3B82F6',
      layout: 'card',
      showLogo: true,
      showQRCode: true,
      showIngredients: true,
      showSteps: false,
      showNutrition: false,
      showRating: true,
      showCookTime: true,
      showServings: true,
    },
    dimensions: SHARE_DIMENSIONS.generic,
    isDefault: true,
  };
};

/**
 * Calcula as melhores dimensões para o conteúdo
 */
export const calculateOptimalDimensions = (
  platform: string,
  format: string
): {width: number; height: number} => {
  const key = `${platform}_${format}` as keyof ShareImageDimensions;
  
  if (SHARE_DIMENSIONS[key]) {
    return SHARE_DIMENSIONS[key];
  }
  
  // Dimensões padrão baseadas no formato
  switch (format) {
    case 'story':
      return {width: 1080, height: 1920};
    case 'post':
      return {width: 1200, height: 630};
    default:
      return {width: 1080, height: 1080};
  }
};

/**
 * Valida se um template é compatível com a plataforma
 */
export const isTemplateCompatible = (
  template: ShareTemplate,
  platform: string,
  format: string
): boolean => {
  // Verifica se a plataforma é compatível
  if (template.platform !== platform && template.platform !== 'generic') {
    return false;
  }
  
  // Verifica se o formato é compatível
  if (template.format !== format && template.format !== 'image') {
    return false;
  }
  
  return true;
};

/**
 * Gera texto de compartilhamento baseado no conteúdo
 */
export const generateShareText = (
  content: ShareableContent,
  platform: string,
  includeHashtags: boolean = true
): string => {
  let text = `Confira esta receita: ${content.title}`;
  
  if (content.description) {
    text += `\n\n${content.description}`;
  }
  
  if (includeHashtags) {
    const hashtags = generateHashtags(content, platform);
    if (hashtags.length > 0) {
      text += `\n\n${hashtags.join(' ')}`;
    }
  }
  
  return text;
};

/**
 * Gera hashtags relevantes para o conteúdo
 */
export const generateHashtags = (
  content: ShareableContent,
  platform: string
): string[] => {
  const hashtags: string[] = ['#receita', '#culinaria', '#cozinha'];
  
  // Hashtags específicas por plataforma
  switch (platform) {
    case 'instagram':
      hashtags.push('#food', '#recipe', '#cooking', '#foodie', '#instafood');
      break;
    case 'twitter':
      hashtags.push('#food', '#recipe', '#cooking');
      break;
    case 'facebook':
      hashtags.push('#receitas', '#comida', '#cozinhar');
      break;
  }
  
  // Limitar número de hashtags por plataforma
  const maxHashtags = platform === 'instagram' ? 10 : 5;
  return hashtags.slice(0, maxHashtags);
};