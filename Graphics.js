global.STDVector = function(cls, len, base) {
  if (base && 'memoryBuffer' in base) {
    return [...Array(len)].map(()=>{let res = new cls(); res.memoryBuffer = base.memoryBuffer; return res;})
  }
  return [...Array(len)].map(()=> new cls());
}

function toRadians(angle) {
  return Math.PI / 180 * angle;
}

const fs = require('fs');
const nvk = require('nvk');
const {vec2, ivec2, uvec2, vec3, vec4, quat, mat4, Vertex, cvec, UniformBufferObject} = require('./VMath.js');
Object.assign(global, nvk);



const validationLayers = [
  // "VK_LAYER_KHRONOS_validation"
];

const enableValidationLayers = true;

const WIDTH = 800;
const HEIGHT = 600;
const MAX_FRAMES_IN_FLIGHT = 1;

class GraphicsClass {
  currentLayerZ = 0;
  indexCount = 0;
  vertexCount = 0;
  vertexCapacity = 1000 * Vertex.size;
  indexCapacity = Uint32Array.BYTES_PER_ELEMENT * 1000;

  vertices = new cvec(Vertex, 1000);
  // indices = new Uint16Array()
  #inDrawState = false;
  #shouldFill = true;
  #shouldStroke = true;
  #strokeColor = new vec4(0,0,0,1);
  #fillColor = new vec4(0,0,0,1);

  constructor(){

    this.currentFrame = 0;
    this.framebufferResized = false;
    // this.vertices = new cvec(Vertex, 4);
    // this.vertices[0].pos = new vec3(-1,-1,0);this.vertices[0].color = new vec3(1,0,0);
    // this.vertices[1].pos = new vec3(1,-1,0);this.vertices[1].color = new vec3(0,1,0);
    // this.vertices[2].pos = new vec3(1,1,0);this.vertices[2].color = new vec3(0,0,1);
    // this.vertices[3].pos = new vec3(-1,1,0);this.vertices[3].color = new vec3(1,1,1);

    // this.indices = new Uint16Array([0,1,2,2,3,0]);
    this.deviceExtensions = new Set([
      VK_KHR_SWAPCHAIN_EXTENSION_NAME
    ]);
    this.cleanup = this.cleanup.bind(this);

    // this.run();
  }

  init(){
    this.initVulkan();

  }

  initWindow() {
    this.win = new VulkanWindow({width: WIDTH, height: HEIGHT, resizable: true, title: "NVK2D Engine"});
    // Graphics.win.onresize = ()=>this.framebufferResized = true;
  }

  setupDebugMessenger(){
    this.debugMessenger = new VkDebugUtilsMessengerEXT();
    if (!enableValidationLayers) return;
    let createInfo = new VkDebugUtilsMessengerCreateInfoEXT();
    createInfo.messageSeverity = VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT;
    createInfo.messageType = VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT | VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT;
    createInfo.pfnUserCallback = Graphics.debugCallback;
    if (vkCreateDebugUtilsMessengerEXT(this.instance, createInfo, null, this.debugMessenger) != VK_SUCCESS) {
      throw new Error("Failed to add debug callback.");
    }
  }

  initVulkan() {
    this.initWindow();
    this.createInstance();
    this.setupDebugMessenger();
    this.createSurface();
    this.pickPhysicalDevice();
    this.createLogicalDevice();
    this.createSwapChain();
    this.createImageViews();
    this.createRenderPass();
    this.createDescriptorSetLayout();
    this.createGraphicsPipeline();
    this.createFramebuffers();
    this.createCommandPool();
    this.createVertexBuffer();
    this.createIndexBuffer();
    this.createUniformBuffers();
    this.createDescriptorPool();
    this.createDescriptorSets();
    this.createCommandBuffers();
    this.createSyncObjects();
  }

  checkValidationLayerSupport(){
    let layerCount = {$: 0};
    vkEnumerateInstanceLayerProperties(layerCount, null);
    let availableLayers = STDVector(VkLayerProperties, layerCount.$);
    vkEnumerateInstanceLayerProperties(layerCount, availableLayers);

    for (let layer of validationLayers) {
      let found = false;
      for (let testLayer of availableLayers) {
        if (testLayer.layerName == layer) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  getRequiredExtensions(){
    let res = Graphics.win.getRequiredInstanceExtensions();
    if (enableValidationLayers) res.push(VK_EXT_DEBUG_UTILS_EXTENSION_NAME);
    return res;
  }

  debugCallback(messageSeverity, messageType, callbackData, userData) {
    console.log("validation layer: " + callbackData.pMessage);
    return false;
  }

  createInstance(){
    if (enableValidationLayers && !this.checkValidationLayerSupport()) {
      throw new Error("Missing validation layers!");
    }
    this.appInfo = new VkApplicationInfo();
    this.appInfo.pApplicationName = "Hello Triangle";
    this.appInfo.pApplicationVersion = VK_MAKE_VERSION(1,0,0);
    this.appInfo.pEngineName = "No Engine";
    this.appInfo.engineVersion = VK_MAKE_VERSION(1,0,0);
    this.appInfo.apiVersion = VK_API_VERSION_1_0;
    let createInfo = new VkInstanceCreateInfo();
    createInfo.pApplicationInfo = this.appInfo;
    let instanceExtensions = this.getRequiredExtensions();
    createInfo.enabledExtensionCount = instanceExtensions.length;
    createInfo.ppEnabledExtensionNames = instanceExtensions;
    if (enableValidationLayers) {
      createInfo.enabledLayerCount = validationLayers.length;
      createInfo.ppEnabledLayerNames = validationLayers;
    } else createInfo.enabledLayerCount = 0;

    this.instance = new VkInstance();

    if (vkCreateInstance(createInfo, null, this.instance) !== VK_SUCCESS) {
      throw new Error("Failed to create instance.")
    }
  }

  queryFeatureSupport(device) {
    // let features2 = new VkPhysicalDeviceFeatures2();
    // features2.pNext = new VkPhysicalDeviceVulkan12Features();
    //
    // vkGetPhysicalDeviceFeatures2(device, features2);
    return true;//features2.pNext.drawIndirectCount;
  }

  isDeviceSuitable(device) {
    let indices = this.findQueueFamilies(device);

    let extensionsSupported = this.checkDeviceExtensionSupport(device);

    let swapChainAdequate = false;
    if (extensionsSupported) {
      let swapChainSupport = this.querySwapChainSupport(device);
      swapChainAdequate = !swapChainSupport.formats.length <= 0 && swapChainSupport.presentModes !== null && !swapChainSupport.presentModes.length <= 0;
    }


    return indices.isComplete() && extensionsSupported && swapChainAdequate && this.queryFeatureSupport(device);
  }

  chooseSwapSurfaceFormat(availableFormats) {
    console.log(availableFormats.map(e=>e.format + " " + e.colorSpace));
    for (let availableFormat of availableFormats) {
      if (availableFormat.format == VK_FORMAT_B8G8R8A8_UNORM && availableFormat.colorSpace == VK_COLOR_SPACE_SRGB_NONLINEAR_KHR) {
        return availableFormat
      }
    }
    return availableFormats[0];
  }

  chooseSwapPresentMode(availablePresentModes){
    if (availablePresentModes.includes(VK_PRESENT_MODE_MAILBOX_KHR)) return VK_PRESENT_MODE_MAILBOX_KHR;
    return VK_PRESENT_MODE_FIFO_KHR;
  }

  chooseSwapExtent(capabilities) {
    if (capabilities.currentExtent.width != 0xFFFFFFFF) {
      return capabilities.currentExtent;
    } else {
      let actualExtent = new VkExtent2D({width: Graphics.win.frameBufferWidth, height: Graphics.win.frameBufferWidth});
      actualExtent.width = Math.max(capabilities.minImageExtent.width, Math.min(capabilities.maxImageExtent.width, actualExtent.width));
      actualExtent.height = Math.max(capabilities.minImageExtent.height, Math.min(capabilities.maxImageExtent.height, actualExtent.height));
      return actualExtent;
    }
  }

  checkDeviceExtensionSupport(device){
    let extensionCount = {$: 0};
    vkEnumerateDeviceExtensionProperties(device, null, extensionCount, null);

    let availableExtensions = STDVector(VkExtensionProperties, extensionCount.$);
    vkEnumerateDeviceExtensionProperties(device, null, extensionCount, availableExtensions);

    let requiredExtensions = new Set(this.deviceExtensions);
    for (let extension of availableExtensions) {
      requiredExtensions.delete(extension.extensionName);
    }
    return requiredExtensions.size <= 0;
  }

  findQueueFamilies(device) {
    let indices = new QueueFamilyIndices();

    let queueFamilyCount = {$:0};
    vkGetPhysicalDeviceQueueFamilyProperties(device, queueFamilyCount, null);

    let queueFamilies = STDVector(VkQueueFamilyProperties, queueFamilyCount.$);
    vkGetPhysicalDeviceQueueFamilyProperties(device, queueFamilyCount, queueFamilies);

    let i = 0;
    for (let queueFamily of queueFamilies) {
      if (queueFamily.queueFlags & VK_QUEUE_GRAPHICS_BIT) {
        indices.graphicsFamily = i;
      }
      let presentSupport = {$: false};
      vkGetPhysicalDeviceSurfaceSupportKHR(device, i, this.surface, presentSupport);
      if (presentSupport.$ == true) {
        indices.presentFamily = i;
      }
      if (indices.isComplete()) break;
      i ++;
    }

    return indices;
  }

  querySwapChainSupport(device){
    let details = new SwapChainSupportDetails();

    vkGetPhysicalDeviceSurfaceCapabilitiesKHR(device, this.surface, details.capabilities);
    //
    let surfaceFormatCount = {$: 0};
    vkGetPhysicalDeviceSurfaceFormatsKHR(device, this.surface, surfaceFormatCount, null);
    if (surfaceFormatCount.$ > 0) {
      details.formats = STDVector(VkSurfaceFormatKHR, surfaceFormatCount.$);
      vkGetPhysicalDeviceSurfaceFormatsKHR(device, this.surface, surfaceFormatCount, details.formats);
    }


    let presentModeCount = {$: 0};
    vkGetPhysicalDeviceSurfacePresentModesKHR(device, this.surface, presentModeCount, null);
    if (presentModeCount.$ > 0) {
      details.presentModes = new Int32Array(presentModeCount.$);
      vkGetPhysicalDeviceSurfacePresentModesKHR(device, this.surface, presentModeCount, details.presentModes);

    }

    return details;
  }

  pickPhysicalDevice(){
    this.physicalDevice = VK_NULL_HANDLE;
    let deviceCount = {$:0};
    vkEnumeratePhysicalDevices(this.instance, deviceCount, null);
    if (deviceCount.$ <= 0 ) throw new Error("No render devices are available.");
    let devices = STDVector(VkPhysicalDevice, deviceCount.$);
    if (vkEnumeratePhysicalDevices(this.instance, deviceCount, devices));
    for (let device of devices) {
      if (this.isDeviceSuitable(device)) {
        this.physicalDevice = device;
        break;
      }
    }

    if (this.physicalDevice == VK_NULL_HANDLE) {
      throw new Error("Failed to find a suitable GPU.")
    }

  }

  createLogicalDevice(){
    this.device = new VkDevice();
    let indices = this.findQueueFamilies(this.physicalDevice);

    let queueCreateInfos = [];
    let uniqueQueueFamilies = new Set([indices.graphicsFamily, indices.presentFamily]);

    for (let queueFamily of uniqueQueueFamilies) {
      console.log("Queue family " + queueFamily);
      let queueCreateInfo = new VkDeviceQueueCreateInfo();
      queueCreateInfo.queueFamilyIndex = queueFamily;
      queueCreateInfo.queueCount = 1;
      queueCreateInfo.pQueuePriorities = new Float32Array([1.0]);
      queueCreateInfos.push(queueCreateInfo);
    }



    let deviceFeatures = new VkPhysicalDeviceFeatures();
    // deviceFeatures.pNext = new VkPhysicalDeviceVulkan12Features();
    // deviceFeatures.pNext.drawIndirectCount = true;

    let createInfo = new VkDeviceCreateInfo();
    // createInfo.pNext = deviceFeatures;
    createInfo.queueCreateInfoCount = queueCreateInfos.length;
    createInfo.pQueueCreateInfos = queueCreateInfos;
    createInfo.pEnabledFeatures = deviceFeatures;
    createInfo.enabledExtensionCount = this.deviceExtensions.size;
    createInfo.ppEnabledExtensionNames = Array.from(this.deviceExtensions);
    createInfo.enabledLayerCount = 0;
    if (vkCreateDevice(this.physicalDevice, createInfo, null, this.device) != VK_SUCCESS) {
      throw new Error("Failed to create logical device.");
    }

    this.graphicsQueue = new VkQueue();
    vkGetDeviceQueue(this.device, indices.graphicsFamily, 0, this.graphicsQueue)

    this.presentQueue = new VkQueue();
    vkGetDeviceQueue(this.device, indices.presentFamily, 0, this.presentQueue)
  }

  recreateSwapChain(){

    let width = Graphics.win.frameBufferWidth;
    let height = Graphics.win.frameBufferHeight;
    // while(width == 0 || height == 0) {
    //   width = Graphics.win.frameBufferWidth;
    //   height = Graphics.win.frameBufferHeight;
    //
    // }
    if (width == 0 || height == 0) return;

    vkDeviceWaitIdle(this.device);
    this.cleanupSwapChain();
    this.createSwapChain();
    this.createImageViews();
    this.createRenderPass();
    this.createGraphicsPipeline();
    this.createFramebuffers();
    this.createUniformBuffers();
    this.createDescriptorPool();
    this.createDescriptorSets();
    this.createCommandBuffers();
  }

  createSwapChain(){
    let swapChainSupport = this.querySwapChainSupport(this.physicalDevice);

    let surfaceFormat = this.chooseSwapSurfaceFormat(swapChainSupport.formats);
    let presentMode = this.chooseSwapPresentMode(swapChainSupport.presentModes);
    let extent = this.chooseSwapExtent(swapChainSupport.capabilities);
    console.log(extent.width, extent.height);
    let imageCount = swapChainSupport.capabilities.minImageCount + 1;
    if (swapChainSupport.capabilities.maxImageCount > 0 && imageCount > swapChainSupport.capabilities.maxImageCount) imageCount = swapChainSupport.capabilities.maxImageCount;
    let createInfo = new VkSwapchainCreateInfoKHR();
    createInfo.surface = this.surface;
    createInfo.minImageCount = imageCount;
    createInfo.imageFormat = surfaceFormat.format;
    createInfo.imageColorSpace = surfaceFormat.colorSpace;
    createInfo.imageExtent.width = extent.width;
    createInfo.imageExtent.height = extent.height;

    console.log(createInfo.imageExtent.width);
    console.log(createInfo.imageExtent.height);
    createInfo.imageArrayLayers = 1;
    createInfo.imageUsage = VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT;

    let indices = this.findQueueFamilies(this.physicalDevice);
    let queueFamilyIndices = new Uint32Array([indices.graphicsFamily, indices.presentFamily]);

    if (indices.graphicsFamily != indices.presentFamily) {
      console.log("Different Queues!");
      createInfo.imageSharingMode = VK_SHARING_MODE_CONCURRENT;
      createInfo.queueFamilyIndexCount = 2;
      createInfo.pQueueFamilyIndices = queueFamilyIndices;
    } else {
      console.log("Same Queues!");

      createInfo.imageSharingMode = VK_SHARING_MODE_EXCLUSIVE;
      // createInfo.queueFamilyIndexCount = 0;
    }

    createInfo.preTransform = swapChainSupport.capabilities.currentTransform;
    createInfo.compositeAlpha = VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR;
    createInfo.presentMode = presentMode;
    createInfo.clipped = true;
    this.swapChain = new VkSwapchainKHR();
    let result = vkCreateSwapchainKHR(this.device, createInfo, null, this.swapChain);
    if (result !== VK_SUCCESS) {
      throw new Error("Failed to create swapchain." + result);
    }
    imageCount = {$: imageCount};
    vkGetSwapchainImagesKHR(this.device, this.swapChain, imageCount, null);
    this.swapChainImages = STDVector(VkImage, imageCount.$);
    vkGetSwapchainImagesKHR(this.device, this.swapChain, imageCount, this.swapChainImages);
    this.swapChainImageFormat = surfaceFormat.format;
    this.swapChainExtent = extent;
  }

  createSurface(){
    this.surface = new VkSurfaceKHR();
    if (Graphics.win.createSurface(this.instance, null, this.surface) !== VK_SUCCESS) {
      throw new Error("Failed to create surface.");
    }



  }

  createImageViews(){
    this.swapChainImageViews = STDVector(VkImageView, this.swapChainImages.length);
    for (let i = 0; i < this.swapChainImages.length; i ++) {
      let createInfo = new VkImageViewCreateInfo();
      createInfo.image = this.swapChainImages[i];
      createInfo.viewType = VK_IMAGE_VIEW_TYPE_2D;
      createInfo.format = this.swapChainImageFormat;
      createInfo.components.r = VK_COMPONENT_SWIZZLE_IDENTITY;
      createInfo.components.g = VK_COMPONENT_SWIZZLE_IDENTITY;
      createInfo.components.b = VK_COMPONENT_SWIZZLE_IDENTITY;
      createInfo.components.a = VK_COMPONENT_SWIZZLE_IDENTITY;
      createInfo.subresourceRange.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
      createInfo.subresourceRange.baseMipLevel = 0;
      createInfo.subresourceRange.levelCount = 1;
      createInfo.subresourceRange.baseArrayLayer = 0;
      createInfo.subresourceRange.layerCount = 1;
      if (vkCreateImageView(this.device, createInfo, null, this.swapChainImageViews[i]) !== VK_SUCCESS) {
        throw new Error("Failed to create image views.");
      }
    }
  }

  createDescriptorSetLayout(){
    let uboLayoutBinding = new VkDescriptorSetLayoutBinding();
    uboLayoutBinding.binding = 0;
    uboLayoutBinding.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
    uboLayoutBinding.descriptorCount = 1;
    uboLayoutBinding.stageFlags = VK_SHADER_STAGE_VERTEX_BIT;

    this.descriptorSetLayout = new VkDescriptorSetLayout();
    let layoutInfo = new VkDescriptorSetLayoutCreateInfo();
    layoutInfo.bindingCount = 1;
    layoutInfo.pBindings = [uboLayoutBinding];

    if (vkCreateDescriptorSetLayout(this.device, layoutInfo, null, this.descriptorSetLayout) != VK_SUCCESS) {
      throw new Error("Failed to create descriptor set layout.");
    }


  }

  createGraphicsPipeline() {
    let vertShaderCode = new Uint8Array(fs.readFileSync('./shaders/out/vert.spv', null));
    let fragShaderCode = new Uint8Array(fs.readFileSync('./shaders/out/frag.spv', null));
    let vertShaderModule = this.createShaderModule(vertShaderCode);
    let fragShaderModule = this.createShaderModule(fragShaderCode);

    let vertShaderStageInfo = new VkPipelineShaderStageCreateInfo();
    vertShaderStageInfo.stage = VK_SHADER_STAGE_VERTEX_BIT;
    vertShaderStageInfo.module = vertShaderModule;
    vertShaderStageInfo.pName = "main";

    let fragShaderStageInfo = new VkPipelineShaderStageCreateInfo();
    fragShaderStageInfo.stage = VK_SHADER_STAGE_FRAGMENT_BIT;
    fragShaderStageInfo.module = fragShaderModule;
    fragShaderStageInfo.pName = "main";

    let shaderStages = [vertShaderStageInfo, fragShaderStageInfo];

    let bindingDescription = Vertex.getBindingDescription();
    let attributeDescriptions = Vertex.getAttributeDescriptions();

    let vertexInputInfo = new VkPipelineVertexInputStateCreateInfo();
    vertexInputInfo.vertexBindingDescriptionCount = 1;
    vertexInputInfo.pVertexBindingDescriptions = [bindingDescription];
    vertexInputInfo.vertexAttributeDescriptionCount = attributeDescriptions.length;
    vertexInputInfo.pVertexAttributeDescriptions = attributeDescriptions;

    let inputAssembly = new VkPipelineInputAssemblyStateCreateInfo();
    inputAssembly.topology = VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST;
    inputAssembly.primativeRestartEnable = false;

    let viewport = new VkViewport();
    viewport.x = 0;
    viewport.y = 0;
    viewport.width = this.swapChainExtent.width;
    viewport.height = this.swapChainExtent.height;
    viewport.minDepth = 0;
    viewport.maxDepth = 1;

    let scissor = new VkRect2D();
    scissor.offset = new VkOffset2D({x: 0, y: 0});
    scissor.extent = this.swapChainExtent;

    let viewportState = new VkPipelineViewportStateCreateInfo();
    viewportState.viewportCount = 1;
    viewportState.pViewports = [viewport];
    viewportState.scissorCount = 1;
    viewportState.pScissors = [scissor];

    let rasterizer = new VkPipelineRasterizationStateCreateInfo();
    rasterizer.depthClampEnable = false;
    rasterizer.rasterizerDiscardEnable = false;
    rasterizer.polygonMode = VK_POLYGON_MODE_FILL;
    rasterizer.lineWidth = 1;
    rasterizer.cullMode = VK_CULL_MODE_NONE;
    rasterizer.frontFace = VK_FRONT_FACE_CLOCKWISE;//_COUNTER
    rasterizer.depthBiasEnable = false;

    let multisampling = new VkPipelineMultisampleStateCreateInfo();
    multisampling.sampleShadingEnable = false;
    multisampling.rasterizationSamples = VK_SAMPLE_COUNT_1_BIT;
    multisampling.minSamppleShading = 1;
    multisampling.pSampleMask = null;
    multisampling.alphaToConvergeEnable = false;
    multisampling.alphaToOneEnable = false;

    let colorBlendAttachment = new VkPipelineColorBlendAttachmentState();
    colorBlendAttachment.colorWriteMask = VK_COLOR_COMPONENT_R_BIT | VK_COLOR_COMPONENT_G_BIT | VK_COLOR_COMPONENT_B_BIT | VK_COLOR_COMPONENT_A_BIT;
    colorBlendAttachment.blendEnable = false;

    /* Alpha blending
    colorBlendAttachment.blendEnable = true;
    colorBlendAttachment.srcColorBlendFactor = VK_BLEND_FACTOR_SRC_ALPHA;
    colorBlendAttachment.dstColorBlendFactor = VK_BLEND_FACTOR_ONE_MINUS_SRC_ALPHA;
    colorBlendAttachment.colorBlendOp = VK_BLEND_OP_ADD;
    colorBlendAttachment.srcAlphaBlendFactor = VK_BLEND_FACTOR_ONE;
    colorBlendAttachment.dstAlphaBlendFactor = VK_BLEND_FACTOR_ZERO;
    colorBlendAttachment.alphaBlendOp = VK_BLEND_OP_ADD;
    */

    let colorBlending = new VkPipelineColorBlendStateCreateInfo();
    colorBlending.logicOpEnable = false;
    colorBlending.attachmentCount = 1;
    colorBlending.pAttachments = [colorBlendAttachment];

    this.pipelineLayout = new VkPipelineLayout();

    let pipelineLayoutInfo = new VkPipelineLayoutCreateInfo();
    pipelineLayoutInfo.setLayoutCount = 1;
    pipelineLayoutInfo.pSetLayouts = [this.descriptorSetLayout];

    if (vkCreatePipelineLayout(this.device, pipelineLayoutInfo, null, this.pipelineLayout) != VK_SUCCESS) {
      throw new Error("Failed to create pipeline layout.")
    }

    let pipelineInfo = new VkGraphicsPipelineCreateInfo();
    pipelineInfo.stageCount = 2;
    pipelineInfo.pStages = shaderStages;
    pipelineInfo.pVertexInputState = vertexInputInfo;
    pipelineInfo.pInputAssemblyState = inputAssembly;
    pipelineInfo.pViewportState = viewportState;
    pipelineInfo.pRasterizationState = rasterizer;
    pipelineInfo.pMultisampleState = multisampling;
    pipelineInfo.pDepthStencilState = null;
    pipelineInfo.pColorBlendState = colorBlending;
    pipelineInfo.pDynamicState = null;
    pipelineInfo.layout = this.pipelineLayout;
    pipelineInfo.renderPass = this.renderPass;
    pipelineInfo.subpass = 0;

    this.graphicsPipeline = new VkPipeline();
    let result = vkCreateGraphicsPipelines(this.device, null, 1, [pipelineInfo], null, [this.graphicsPipeline]);
    if (result != VK_SUCCESS) {
      console.log(result);
      throw new Error("Failed to create graphics pipelines.");
    }




    vkDestroyShaderModule(this.device, fragShaderModule, null);
    vkDestroyShaderModule(this.device, vertShaderModule, null);

  }

  createRenderPass(){
    let colorAttachment = new VkAttachmentDescription();
    colorAttachment.format = this.swapChainImageFormat;
    colorAttachment.samples = VK_SAMPLE_COUNT_1_BIT;
    colorAttachment.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
    colorAttachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
    colorAttachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
    colorAttachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
    colorAttachment.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
    colorAttachment.finalLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;

    let colorAttachmentRef = new VkAttachmentReference();
    colorAttachmentRef.attachment = 0;
    colorAttachmentRef.layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

    let subpass = new VkSubpassDescription();
    subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
    subpass.colorAttachmentCount = 1;
    subpass.pColorAttachments = [colorAttachmentRef];

    let dependency = new VkSubpassDependency();
    dependency.srcSubpass = VK_SUBPASS_EXTERNAL;
    dependency.dstSubpass = 0;
    dependency.srcStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
    dependency.srcAccessMask = 0;
    dependency.dstStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
    dependency.dstAccessMask = VK_ACCESS_COLOR_ATTACHMENT_READ_BIT | VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;

    this.renderPass = new VkRenderPass();

    let renderPassInfo = new VkRenderPassCreateInfo();
    renderPassInfo.attachmentCount = 1;
    renderPassInfo.pAttachments = [colorAttachment];
    renderPassInfo.subpassCount = 1;
    renderPassInfo.pSubpasses = [subpass];
    renderPassInfo.dependencyCount = 1;
    renderPassInfo.pDependencies = [dependency];

    if (vkCreateRenderPass(this.device, renderPassInfo, null, this.renderPass) != VK_SUCCESS) {
      throw new Error("Failed to create render pass.");
    }


  }

  createShaderModule(code){
    let createInfo = new VkShaderModuleCreateInfo();
    createInfo.codeSize = code.length;
    createInfo.pCode = code;
    let shaderModule = new VkShaderModule();
    if (vkCreateShaderModule(this.device, createInfo, null, shaderModule) !== VK_SUCCESS) {
      throw new Error("Failed to create shader module.");
    }
    return shaderModule;
  }

  createFramebuffers(){
    this.swapChainFramebuffers = STDVector(VkFramebuffer, this.swapChainImageViews.length);

    for (let i = 0; i < this.swapChainImageViews.length; i ++) {
      let attachments = [this.swapChainImageViews[i]];
      let framebufferInfo = new VkFramebufferCreateInfo();
      framebufferInfo.renderPass = this.renderPass;
      framebufferInfo.attachmentCount = 1;
      framebufferInfo.pAttachments = attachments;
      framebufferInfo.width = this.swapChainExtent.width;
      framebufferInfo.height = this.swapChainExtent.height;
      framebufferInfo.layers = 1;

      if (vkCreateFramebuffer(this.device, framebufferInfo, null, this.swapChainFramebuffers[i]) != VK_SUCCESS) {
        throw new Error("Failed to create framebuffers.")
      }
    }

  }

  createCommandPool(){
    this.commandPool = new VkCommandPool();
    let queueFamilyIndices = this.findQueueFamilies(this.physicalDevice);
    let poolInfo = new VkCommandPoolCreateInfo();
    poolInfo.queueFamilyIndex = queueFamilyIndices.graphicsFamily;
    poolInfo.flags = 0;

    if (vkCreateCommandPool(this.device, poolInfo, null, this.commandPool) !== VK_SUCCESS) {
      throw new Error('Failed to create command pool.');
    }
  }

  findMemoryType(typeFilter, properties){
    let memProperties = new VkPhysicalDeviceMemoryProperties();
    vkGetPhysicalDeviceMemoryProperties(this.physicalDevice, memProperties);
    for (let i = 0; i < memProperties.memoryTypeCount; i ++) {
      if ((typeFilter & (1 << i)) && (memProperties.memoryTypes[i].propertyFlags & properties) == properties) {
        return i;
      }
    }
    throw new Error("Failed to find suitable memory type.");
  }

  createBuffer(size, usage, properties, buffer, memory){
    let bufferInfo = new VkBufferCreateInfo();
    bufferInfo.size = size;
    bufferInfo.usage = usage;
    bufferInfo.sharingMode = VK_SHARING_MODE_EXCLUSIVE;
    if (vkCreateBuffer(this.device, bufferInfo, null, buffer) != VK_SUCCESS) {
      throw new Error("Failed to create vertex buffer!");
    }

    let memRequirements = new VkMemoryRequirements();
    vkGetBufferMemoryRequirements(this.device, buffer, memRequirements);

    let allocInfo = new VkMemoryAllocateInfo();
    allocInfo.allocationSize = memRequirements.size;
    allocInfo.memoryTypeIndex = this.findMemoryType(memRequirements.memoryTypeBits, properties);

    if (vkAllocateMemory(this.device, allocInfo, null, memory) != VK_SUCCESS) {
      throw new Error("Failed to allocate vertex buffer memory.");
    }
    let result = vkBindBufferMemory(this.device, buffer, memory, 0n);
    if (result != VK_SUCCESS) throw new Error("Failed to bind buffer memory. " + result)
  }

  copyBuffer(srcBuffer, dstBuffer, size){
    let allocInfo = new VkCommandBufferAllocateInfo();
    allocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
    allocInfo.commandPool = this.commandPool;
    allocInfo.commandBufferCount = 1;

    let commandBuffer = new VkCommandBuffer();
    vkAllocateCommandBuffers(this.device, allocInfo, [commandBuffer]);

    let beginInfo = new VkCommandBufferBeginInfo();
    beginInfo.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

    vkBeginCommandBuffer(commandBuffer, beginInfo);

    let copyRegion = new VkBufferCopy();
    copyRegion.size = size;
    vkCmdCopyBuffer(commandBuffer, srcBuffer, dstBuffer, 1, [copyRegion]);

    vkEndCommandBuffer(commandBuffer);

    let submitInfo = new VkSubmitInfo();
    submitInfo.commandBufferCount = 1;
    submitInfo.pCommandBuffers = [commandBuffer];
    vkQueueSubmit(this.graphicsQueue, 1, [submitInfo], null);
    vkQueueWaitIdle(this.graphicsQueue);
    vkFreeCommandBuffers(this.device, this.commandPool, 1, [commandBuffer]);
  }

  createIndexBuffer(){
    this.indexBuffer = new VkBuffer();
    this.indexBufferMemory = new VkDeviceMemory();
    let bufferSize = this.indexCapacity;

    this.indexStagingBuffer = new VkBuffer();
    this.indexStagingBufferMemory = new VkDeviceMemory();

    this.createBuffer(bufferSize, VK_BUFFER_USAGE_TRANSFER_SRC_BIT, VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT, this.indexStagingBuffer, this.indexStagingBufferMemory);
    this.createBuffer(bufferSize, VK_BUFFER_USAGE_TRANSFER_DST_BIT | VK_BUFFER_USAGE_INDEX_BUFFER_BIT, VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT, this.indexBuffer, this.indexBufferMemory);

    // let data = {$:0n};
    // if (vkMapMemory(this.device, this.indexStagingBufferMemory, 0n, bufferSize, 0, data) != VK_SUCCESS)
    //   throw new Error("Failed to map memory.");
    //
    // let indicesView = new Uint16Array(ArrayBuffer.fromAddress(data.$, bufferSize));
    // let indexData = this.indices;
    // indicesView.set(indexData, 0x0);
    // vkUnmapMemory(this.device, this.indexStagingBufferMemory);


    // this.copyBuffer(this.indexStagingBuffer, this.indexBuffer, bufferSize);
    // vkDestroyBuffer(this.device, this.indexStagingBuffer, null);
    // vkFreeMemory(this.device, this.indexStagingBufferMemory, null);
  }

  createVertexBuffer(){
    this.vertexBuffer = new VkBuffer();
    this.vertexBufferMemory = new VkDeviceMemory();


    let bufferSize = this.vertexCapacity;

    this.vertexStagingBuffer = new VkBuffer();
    this.vertexStagingBufferMemory = new VkDeviceMemory();

    this.createBuffer(bufferSize, VK_BUFFER_USAGE_TRANSFER_SRC_BIT, VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT, this.vertexStagingBuffer, this.vertexStagingBufferMemory);

    this.createBuffer(bufferSize, VK_BUFFER_USAGE_TRANSFER_DST_BIT | VK_BUFFER_USAGE_VERTEX_BUFFER_BIT, VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT, this.vertexBuffer, this.vertexBufferMemory);
    // let data = {$:0n};
    // if (vkMapMemory(this.device, this.vertexStagingBufferMemory, 0n, bufferSize, 0, data) != VK_SUCCESS)
    //   throw new Error("Failed to map memory.");
    //
    // let verticesView = new Uint8Array(ArrayBuffer.fromAddress(data.$, bufferSize));
    // let vertexData = this.vertices.data();
    // verticesView.set(vertexData, 0x0);
    // vkUnmapMemory(this.device, this.vertexStagingBufferMemory);

    // this.copyBuffer(this.vertexStagingBuffer, this.vertexBuffer, bufferSize);
    //
    // vkDestroyBuffer(this.device, this.vertexStagingBuffer, null);
    // vkFreeMemory(this.device, this.vertexStagingBufferMemory, null);
  }

  createUniformBuffers(){
    this.uniformBuffers = STDVector(VkBuffer, this.swapChainImages.length);
    this.uniformBuffersMemory = STDVector(VkDeviceMemory, this.swapChainImages.length);
    // this.uniformBuffer = new VkBuffer();
    // this.uniformBufferMemory = new VkDeviceMemory();
    let bufferSize = UniformBufferObject.size;

    for (let i = 0; i < this.swapChainImages.length; i ++) {
      this.createBuffer(bufferSize, VK_BUFFER_USAGE_UNIFORM_BUFFER_BIT, VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT, this.uniformBuffers[i], this.uniformBuffersMemory[i]);
    }
  }

  createDrawDataBuffers(){
    this.drawDataBuffers = STDVector(VkBuffer, this.swapChainImages.length);
    // this.
    // TODO: Add draw data buffers.
  }

  createDescriptorPool(){
    let poolSize = new VkDescriptorPoolSize();
    poolSize.type = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
    poolSize.descriptorCount = this.swapChainImages.length;

    let poolInfo = new VkDescriptorPoolCreateInfo();
    poolInfo.poolSizeCount = 1;
    poolInfo.pPoolSizes = [poolSize];
    poolInfo.maxSets = this.swapChainImages.length;
    this.descriptorPool = new VkDescriptorPool();
    if (vkCreateDescriptorPool(this.device, poolInfo, null, this.descriptorPool) !== VK_SUCCESS) {
      throw new Error("Failed to create descriptor pool.");
    }
  }

  createDescriptorSets(){
    let layouts = STDVector(VkDescriptorSetLayout, this.swapChainImages.length).fill(this.descriptorSetLayout);
    let allocInfo = new VkDescriptorSetAllocateInfo();
    allocInfo.descriptorPool = this.descriptorPool;
    allocInfo.descriptorSetCount = this.swapChainImages.length;
    allocInfo.pSetLayouts = layouts;
    this.descriptorSets = STDVector(VkDescriptorSet, this.swapChainImages.length);
    if (vkAllocateDescriptorSets(this.device, allocInfo, this.descriptorSets) != VK_SUCCESS) {
      throw new Error("Failed to allocate descriptor sets.");
    }

    for (let i = 0; i < this.swapChainImages.length; i ++) {
      let bufferInfo = new VkDescriptorBufferInfo();
      bufferInfo.buffer = this.uniformBuffers[i];
      bufferInfo.offset = 0;
      bufferInfo.range = UniformBufferObject.size;

      let descriptorWrite = new VkWriteDescriptorSet();
      descriptorWrite.dstSet = this.descriptorSets[i];
      descriptorWrite.dstBinding = 0;
      descriptorWrite.dstArrayElement = 0;
      descriptorWrite.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
      descriptorWrite.descriptorCount = 1;
      descriptorWrite.pBufferInfo = [bufferInfo];

      vkUpdateDescriptorSets(this.device, 1, [descriptorWrite], 0, null);
    }
  }

  createCommandBuffers(){
    this.commandBuffers = STDVector(VkCommandBuffer, this.swapChainFramebuffers.length);
    let allocInfo = new VkCommandBufferAllocateInfo();
    allocInfo.commandPool = this.commandPool;
    allocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
    allocInfo.commandBufferCount = this.commandBuffers.length;
    if (vkAllocateCommandBuffers(this.device, allocInfo, this.commandBuffers) !== VK_SUCCESS) {
      throw new Error("Failed to create command buffers.");
    }

    for (let i = 0; i < this.commandBuffers.length; i ++) {
      let beginInfo = new VkCommandBufferBeginInfo();
      if (vkBeginCommandBuffer(this.commandBuffers[i], beginInfo) != VK_SUCCESS) {
        throw new Error("Failed to begin recording command buffer.");
      }
      let clearColor = new VkClearValue();
      clearColor.color.float32 = [0,0,0,1];
      clearColor.depthStencil.depth = 1;
      clearColor.depthStencil.stencil = 0; //({color: new VkClearColorValue({float32: [0,0,0,1]}), depthStencil: new VkClearDepthStencilValue({depth: 1, stencil: 0})});
      let renderPassInfo = new VkRenderPassBeginInfo();
      renderPassInfo.renderPass = this.renderPass;
      renderPassInfo.framebuffer = this.swapChainFramebuffers[i];
      renderPassInfo.renderArea.offset.x = 0;
      renderPassInfo.renderArea.offset.y = 0;// = new VkOffset2D({x: 0, y: 0});
      renderPassInfo.renderArea.extent.width = this.swapChainExtent.width;
      renderPassInfo.renderArea.extent.height = this.swapChainExtent.height;
      console.log(renderPassInfo.renderArea.offset.x, renderPassInfo.renderArea.offset.y, renderPassInfo.renderArea.extent.width, renderPassInfo.renderArea.extent.height);

      renderPassInfo.clearValueCount = 1;
      renderPassInfo.pClearValues = [clearColor];


      // console.log("After info creation.");
      vkCmdBeginRenderPass(this.commandBuffers[i], renderPassInfo, VK_SUBPASS_CONTENTS_INLINE);
      // console.log("After BeginRenderPass.");
      vkCmdBindPipeline(this.commandBuffers[i], VK_PIPELINE_BIND_POINT_GRAPHICS, this.graphicsPipeline);
      // console.log("After BindPipeline.");
      let vertexBuffers = [this.vertexBuffer];
      let offsets = new BigUint64Array([0n]);
      vkCmdBindVertexBuffers(this.commandBuffers[i], 0, 1, vertexBuffers, offsets);

      vkCmdBindIndexBuffer(this.commandBuffers[i], this.indexBuffer, 0n, VK_INDEX_TYPE_UINT16);

      vkCmdBindDescriptorSets(this.commandBuffers[i], VK_PIPELINE_BIND_POINT_GRAPHICS, this.pipelineLayout, 0, 1, [this.descriptorSets[i]], 0, null)

      // vkCmdDraw(this.commandBuffers[i], 3, 1, 0, 0);//this.vertices.length
      vkCmdDrawIndexed(this.commandBuffers[i], 6, 2, 0, 0, 0);
      /*
      vkCmdDrawIndexedIndirectCountKHR(
          VkCommandBuffer                             commandBuffer,
          VkBuffer                                    buffer, // Must be VK_BUFFER_USAGE_INDIRECT_BUFFER_BIT
          VkDeviceSize                                offset,
          VkBuffer                                    countBuffer, // Can be same as buffer
          VkDeviceSize                                countBufferOffset,
          uint32_t                                    maxDrawCount,
          uint32_t                                    stride);
      */
      // console.log("After Draw.");
      vkCmdEndRenderPass(this.commandBuffers[i]);

      vkCmdFillBuffer(this.commandBuffers[i], this.vertexStagingBuffer, 0n, VK_WHOLE_SIZE, 0);
      vkCmdFillBuffer(this.commandBuffers[i], this.indexStagingBuffer, 0n, VK_WHOLE_SIZE, 0);
      // console.log("After EndRenderPass.");
      if (vkEndCommandBuffer(this.commandBuffers[i]) != VK_SUCCESS) {
        throw new Error("Failed to record command buffer");
      }

    }
  }

  createSyncObjects(){
      this.imageAvaialableSemaphores = STDVector( VkSemaphore, MAX_FRAMES_IN_FLIGHT);
      this.renderFinishedSemaphores = STDVector( VkSemaphore, MAX_FRAMES_IN_FLIGHT);
      this.inFlightFences = STDVector(VkFence, MAX_FRAMES_IN_FLIGHT);
      this.imagesInFlight = [].fill(null, 0, this.swapChainImages.length);

      let semaphoreInfo = new VkSemaphoreCreateInfo();
      let fenceInfo = new VkFenceCreateInfo();
      fenceInfo.flags = VK_FENCE_CREATE_SIGNALED_BIT;
      for (let i = 0; i < MAX_FRAMES_IN_FLIGHT; i ++) {
        if (vkCreateSemaphore(this.device, semaphoreInfo, null, this.imageAvaialableSemaphores[i]) !== VK_SUCCESS ||
            vkCreateSemaphore(this.device, semaphoreInfo, null, this.renderFinishedSemaphores[i]) !== VK_SUCCESS  ||
            vkCreateFence(this.device, fenceInfo, null, this.inFlightFences[i]) != VK_SUCCESS) {
          throw new Error("Failed to create synchronization objects for frame " + i + ".");
        }
      }


  }



  cleanupSwapChain(){
    for (let framebuffer of this.swapChainFramebuffers) {
      vkDestroyFramebuffer(this.device, framebuffer, null);
    }
    vkFreeCommandBuffers(this.device, this.commandPool, this.commandBuffers.length, this.commandBuffers);
    vkDestroyPipeline(this.device, this.graphicsPipeline, null);
    vkDestroyPipelineLayout(this.device, this.pipelineLayout, null);
    vkDestroyRenderPass(this.device, this.renderPass, null);
    for (let imageView of this.swapChainImageViews) {
      vkDestroyImageView(this.device, imageView, null);
    }
    vkDestroySwapchainKHR(this.device, this.swapChain, null);

    for (let i = 0; i < this.swapChainImages.length; i ++) {
      vkDestroyBuffer(this.device, this.uniformBuffers[i], null);
      vkFreeMemory(this.device, this.uniformBuffersMemory[i], null);
    }

    vkDestroyDescriptorPool(this.device, this.descriptorPool, null);
  }

  cleanup(code){
    vkDeviceWaitIdle(this.device);
    console.log("Recieved code " + code);
    console.log("Cleaning up....");

    this.cleanupSwapChain();

    vkDestroyDescriptorSetLayout(this.device, this.descriptorSetLayout, null);

    vkDestroyBuffer(this.device, this.indexBuffer, null);
    vkFreeMemory(this.device, this.indexBufferMemory, null);

    vkDestroyBuffer(this.device, this.vertexBuffer, null);
    vkFreeMemory(this.device, this.vertexBufferMemory, null);

    vkDestroyBuffer(this.device, this.indexStagingBuffer, null);
    vkFreeMemory(this.device, this.indexStagingBufferMemory, null);

    vkDestroyBuffer(this.device, this.vertexStagingBuffer, null);
    vkFreeMemory(this.device, this.vertexStagingBufferMemory, null);

    for (let i = 0; i < MAX_FRAMES_IN_FLIGHT; i ++) {
      vkDestroySemaphore(this.device, this.renderFinishedSemaphores[i], null);
      vkDestroySemaphore(this.device, this.imageAvaialableSemaphores[i], null);
      vkDestroyFence(this.device, this.inFlightFences[i], null);
    }
    vkDestroyCommandPool(this.device, this.commandPool, null);

    vkDestroyDevice(this.device, null);
    vkDestroySurfaceKHR(this.instance, this.surface, null);
    vkDestroyInstance(this.instance, null);
    console.log("Done! Goodbye!");
  }

  drawFrame(deltaTime){
    vkWaitForFences(this.device, 1, [this.inFlightFences[this.currentFrame]], true, Number.MAX_SAFE_INTEGER);
    let vertexAddress = {$: 0n};
    let indexAddress = {$: 0n};
    this.vertexCount = 0;
    this.indexCount = 0;
    if (vkMapMemory(this.device, this.vertexStagingBufferMemory, 0, this.vertexCapacity, 0, vertexAddress) !== VK_SUCCESS) {
      throw new Error("Failed to map vertex memory.")
    }
    if (vkMapMemory(this.device, this.indexStagingBufferMemory, 0, this.indexCapacity, 0, indexAddress) !== VK_SUCCESS) {
      throw new Error("Failed to map index memory.")
    }
    this.vertices.resize(ArrayBuffer.fromAddress(vertexAddress.$, this.vertexCapacity));
    this.indices = new Uint16Array(ArrayBuffer.fromAddress(indexAddress.$, this.indexCapacity));
    this.#inDrawState = true;
    Engine.game.draw(deltaTime);
    this.#inDrawState = false;
    vkUnmapMemory(this.device, this.vertexStagingBufferMemory);
    vkUnmapMemory(this.device, this.indexStagingBufferMemory);

    this.copyBuffer(this.vertexStagingBuffer, this.vertexBuffer, this.vertexCapacity);
    this.copyBuffer(this.indexStagingBuffer, this.indexBuffer, this.indexCapacity);

    // console.log("Drawing Frame");
    // console.log("Waiting for fence 0x" + new BigUint64Array(this.inFlightFences[this.currentFrame].memoryBuffer, 0, 1)[0]);
    let imageIndex = {$: 0};
    let result = vkAcquireNextImageKHR(this.device, this.swapChain, Number.MAX_SAFE_INTEGER, this.imageAvaialableSemaphores[this.currentFrame], null, imageIndex);
    if (result == VK_ERROR_OUT_OF_DATE_KHR) {
      this.recreateSwapChain();
      return;
    } else if (result != VK_SUCCESS && result != VK_SUBOPTIMAL_KHR) {
      throw new Error("Failed to acquire swap chain image.");
    }

    if (this.imagesInFlight[imageIndex.$]) {
      // console.log("Waiting for in flight image at fence 0x" + new BigUint64Array(this.imagesInFlight[imageIndex.$].memoryBuffer, 0, 1)[0]);

      vkWaitForFences(this.device, 1, [this.imagesInFlight[imageIndex.$]], true, Number.MAX_SAFE_INTEGER);
    }
    // console.log("Marking image fence for index " + imageIndex.$ + " with fence 0x" + new BigUint64Array(this.inFlightFences[this.currentFrame].memoryBuffer, 0, 1)[0]);
    this.imagesInFlight[imageIndex.$] = this.inFlightFences[this.currentFrame];

    this.updateUniformBuffer(imageIndex.$, deltaTime);

    let submitInfo = new VkSubmitInfo();
    let waitSemaphores = [this.imageAvaialableSemaphores[this.currentFrame]];
    let waitStages = new Int32Array([VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT]);
    submitInfo.waitSemaphoreCount = 1;
    submitInfo.pWaitSemaphores = waitSemaphores;
    submitInfo.pWaitDstStageMask = waitStages;
    submitInfo.commandBufferCount = 1;
    submitInfo.pCommandBuffers = [this.commandBuffers[imageIndex.$]];
    let signalSemaphores = [this.renderFinishedSemaphores[this.currentFrame]];
    submitInfo.signalSemaphoreCount = 1;
    submitInfo.pSignalSemaphores = signalSemaphores;
    // console.log("Resetting fence 0x" + new BigUint64Array(this.inFlightFences[this.currentFrame].memoryBuffer, 0, 1)[0]);
    result = vkResetFences(this.device, 1, [this.inFlightFences[this.currentFrame]]);
    if (result != VK_SUCCESS) {
      throw new Error("Failed to reset fence. " + result);
    }
    result = vkQueueSubmit(this.graphicsQueue, 1, [submitInfo], this.inFlightFences[this.currentFrame]);
    if (result != VK_SUCCESS) {
      throw new Error("Failed to submit draw command buffer. " + result);
    }

    let imageIndices = new Uint32Array([imageIndex.$]);

    let presentInfo = new VkPresentInfoKHR();
    presentInfo.waitSemaphoreCount = 1;
    presentInfo.pWaitSemaphores = signalSemaphores;
    presentInfo.swapchainCount = 1;
    presentInfo.pSwapchains = [this.swapChain];
    presentInfo.pImageIndices = imageIndices;
    result = vkQueuePresentKHR(this.presentQueue, presentInfo);
    if (result == VK_ERROR_OUT_OF_DATE_KHR || result == VK_SUBOPTIMAL_KHR || this.framebufferResized) {
      this.framebufferResized = false;
      this.recreateSwapChain();
    } else if (result != VK_SUCCESS ) {
      throw new Error("Failed to present swap chain image.");
    }
    this.currentFrame = (this.currentFrame + 1) % MAX_FRAMES_IN_FLIGHT;
  }

  updateUniformBuffer(currentImage, deltaTime) {
    let ubo = new UniformBufferObject();
    let scale = new mat4(0.1);
    scale[3][3] = 1;
    ubo.model = new mat4(1);//new quat(0,0,0,1).rotate(new vec3(0,0,1), Number(this.currentTime - this.startTime) / 1e9 * 90).toMat().mult(scale);
    // ubo.model = new mat4(1);
    // ubo.model[3][3] = 1;//
    ubo.view = new mat4(1);
    // ubo.view = mat4.lookAt(new vec3(0.000001,0,30), new vec3(0,0,0), new vec3(0,0,1));//new mat4(1);//
    // ubo.proj = mat4.perspective(toRadians(45), this.swapChainExtent.width / this.swapChainExtent.height, 0.1, 100);
    let w2 = Graphics.win.frameBufferWidth/2;
    let h2 = Graphics.win.frameBufferHeight/2;
    ubo.proj = mat4.orthographic(-1,1,-1,1,100000,0);
    // ubo.proj[1][1] *= -1;
    // console.log(ubo);

    let data = {$: 0n};
    vkMapMemory(this.device, this.uniformBuffersMemory[currentImage], 0, UniformBufferObject.size, 0, data);
    let uboView = new Float32Array(ArrayBuffer.fromAddress(data.$, UniformBufferObject.size));
    let uboData = ubo.float32;
    // console.log(uboData);
    uboView.set(uboData, 0x0);

    vkUnmapMemory(this.device, this.uniformBuffersMemory[currentImage]);
  }

  //Graphics API functions
  rectangle(x, y, w, h) {

  }

  rawTriangle(p1, p2, p3, color){
    let i = this.vertexCount;
    this.indices.push(i,i+1,i+3);
    this.indexCount += 3;
    this.vertices[i].pos = new vec3(p1, this.currentLayerZ);
    this.vertices[i].color = color;
    this.vertices[i + 1].pos = new vec3(p2, this.currentLayerZ);
    this.vertices[i + 1].color = color;
    this.vertices[i + 2].pos = new vec3(p3, this.currentLayerZ);
    this.vertices[i + 2].color = color;
    this.vertexCount += 3;
    return [i, i+1, i+2];
  }

  rawLine(p1, p2, inDir, outDir, color, lineWidth) {
    let inABNorm = inDir.normalised().mult(-1);
    let inBCNorm = p2.sub(p1).normalised();
    let inBeta = Math.acos(inABNorm.dot(inBCNorm));
    let inGamma = Math.PI/2 - inBeta/2;
    let inLen = lineWidth / Math.cos(inGamma);
    let inPerp = new vec2(inBCNorm.y, -inBCNorm.x).rotate(-inGamma).normalised().mult(inLen);//Might need to be -gamma;

    console.log(inPerp +"");

    let outABNorm = p1.sub(p2).normalised();
    let outBCNorm = outDir.normalised();
    let outBeta = Math.acos(outABNorm.dot(outBCNorm));
    let outGamma = Math.PI/2 - outBeta/2;
    let outLen = lineWidth / Math.cos(outGamma);
    let outPerp = new vec2(outABNorm.y, -outABNorm.x).rotate(-outGamma).normalised().mult(-outLen);

    console.log(outPerp +"");

    // let inLen = lineWidth / (2 * Math.sin(Math.acos(inABNorm.dot(inBCNorm))));
    // // console.log(inABNorm.dot(inBCNorm));
    // let outABNorm = p1.sub(p2).normalised();
    // let outBCNorm = outDir.normalised();
    // let outLen = lineWidth / (2 * Math.sin(Math.acos(outABNorm.dot(outBCNorm))));
    // // console.log(outLen);
    // let inPerp = inABNorm.mult(inLen).add(inBCNorm.mult(inLen));
    // let outPerp = outABNorm.mult(outLen).add(outBCNorm.mult(outLen));//p2.normalised().add(outDir.normalised()).mult(2);
    let i = this.vertexCount;
    let inD = p1.add(inPerp);
    let inE = p1.sub(inPerp);
    let outD = p2.add(outPerp);
    let outE = p2.sub(outPerp);

    // console.log(`${inD}, ${inE}, ${outD}, ${outE}`);

    this.vertices[i].pos = new vec3(inD, this.currentLayerZ);
    this.vertices[i].color = color;
    this.vertices[i+1].pos = new vec3(inE, this.currentLayerZ);
    this.vertices[i+1].color = color;
    this.vertices[i+2].pos = new vec3(outD, this.currentLayerZ);
    this.vertices[i+2].color = color;
    this.vertices[i+3].pos = new vec3(outE, this.currentLayerZ);
    this.vertices[i+3].color = color;
    this.vertexCount += 4;

    this.indices.set([i,i+2,i+1,i+2,i+3,i+1], this.indexCount);
    this.indexCount += 6;

    // return [i, i + 1, i + 2, i + 3];
  }

  rawLineList(points, color, lineWidth, closed) {
    let inPerp;
    if (closed) {
      let inABNorm = points[points.length-1].sub(points[0]).normalised();
      let inBCNorm = points[1].sub(points[0]).normalised();
      let inLen = lineWidth / (2 * Math.sin(Math.acos(inABNorm.dot(inBCNorm))));
      inPerp = inABNorm.mult(inLen).add(inBCNorm.mult(inLen));
    } else {
      let inDir = points[1].sub(points[0]).normalised();
      inPerp = new vec2(inDir.y, -inDir.x).mult(inLen);
    }
    let inD = p1.add(inPerp);
    let inE = p1.sub(inPerp);
    this.vertices[this.vertexCount].color = color;
    this.vertices[this.vertexCount++].pos = inD;
    this.vertices[this.vertexCount].color = color;
    this.vertices[this.vertexCount++].pos = inE;
    for (let i = 0; i < points.length - 2; i ++) {
      let p1 = points[i];
      let p2 = points[i + 1];
      let p3 = points[i + 2];
      let outABNorm = p1.sub(p2).normalised();
      let outBCNorm = p3.sub(p2).normalised();
      let outLen = lineWidth / (2 * Math.sin(Math.acos(outABNorm.dot(outBCNorm))));
      let outPerp = outABNorm.mult(outLen).add(outBCNorm.mult(outLen));
      let outD = p2.add(outPerp);
      let outE = p2.sub(outPerp);
      this.vertices[this.vertexCount].color = color;
      this.vertices[this.vertexCount++].pos = outD;
      this.vertices[this.vertexCount].color = color;
      this.vertices[this.vertexCount++].pos = outE;
      let j = this.vertexCount;
      this.indices.set([j-3,j-1,j-2,j-1,j,j-2], this.indexCount);
      this.indexCount += 6;
    }
    if (closed){
      let p1 = points[i];
      let p2 = points[i + 1];
      let p3 = points[0];
      let outABNorm = p1.sub(p2).normalised();
      let outBCNorm = p3.sub(p2).normalised();
      let outLen = lineWidth / (2 * Math.sin(Math.acos(outABNorm.dot(outBCNorm))));
      let outPerp = outABNorm.mult(outLen).add(outBCNorm.mult(outLen));
      let outD = p2.add(outPerp);
      let outE = p2.sub(outPerp);
      this.vertices[this.vertexCount].color = color;
      this.vertices[this.vertexCount++].pos = outD;
      this.vertices[this.vertexCount].color = color;
      this.vertices[this.vertexCount++].pos = outE;
      let j = this.vertexCount;
      let k = this.vertexCount - 2 * (points.length - 2);
      this.indices.set([j-3,j-1,j-2,j-1,j,j-2,j-1,k-1,j,k-1,k,j], this.indexCount);
      this.indexCount += 12;
    } else {
      let p1 = points[i];
      let p2 = points[i + 1];
      let outDir = p2.sub(p1).normalised();
      let outPerp = new vec2(outDir.y, -outDir.x).mult(inLen);
      let outD = p2.add(outPerp);
      let outE = p2.sub(outPerp);
      this.vertices[this.vertexCount].color = color;
      this.vertices[this.vertexCount++].pos = outD;
      this.vertices[this.vertexCount].color = color;
      this.vertices[this.vertexCount++].pos = outE;
      let j = this.vertexCount;
      this.indices.set([j-3,j-1,j-2,j-1,j,j-2], this.indexCount);
      this.indexCount += 6;
    }
  }

  triangle(p1, p2, p3) {
    if (this.shouldFill) {
      this.rawTriangle(p1, p2, p3, this.fillColor)
      this.currentLayerZ ++;
    }
    if (this.shouldStroke) {
      this.rawLineList([p1, p2, p3], this.strokeColor, this.lineWidth, true);
    }

  }

}

// let app;
//
// process.on('uncaughtException', (e)=>{
//   console.error(e);
//   app.cleanup();
//   process.exit();
// })

class QueueFamilyIndices {
  constructor(){
    this.graphicsFamily = null;
    this.presentFamily = null;
  }

  isComplete(){
    return this.graphicsFamily !== null && this.presentFamily !== null;
  }
}

class SwapChainSupportDetails {
  constructor(){
    this.capabilities = new VkSurfaceCapabilitiesKHR();
    this.formats = [];
    this.presentModes = null;
  }
}

global.Graphics = new GraphicsClass();
// app = new Graphics();
